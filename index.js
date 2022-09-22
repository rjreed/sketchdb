// LIBRARIES

/// node/core libs
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;

/// vendor libs

/// app/local libs


// APP

//// define paths for application
let store_directory;
//// make application base directory  global

if (process.env.NODE_ENV === 'test') {
  store_directory = path.join(__dirname, 'tests/fixtures/');
}
else {
  store_directory = path.join(process.cwd(), 'carDB_store/');
}

//// init carDB object for export
const carDB = {};

carDB._store = store_directory;

//// function to insert a new row into a table
carDB.insert = function(table, id, data) {

  return new Promise(async function(resolve, reject) {
    //// path to the item/file to be written
    const row_path = path.join(store_directory, 'tables/', table, id + '/');

    //// stringify the data
    const  stringified =  JSON.stringify(data);

    //// make the folder 
    fsp.mkdir(row_path).then(async () => {
       //// write the stringified data to a json file in the folder
      await fsp.writeFile(row_path + id + '.json', stringified).catch(error => {
        reject(error);
      });
      resolve([table, id, data]);
    }).catch(error => {
      reject(error);
    });

  });
};


//// function to update a row
carDB.update = function(table, id, data) {

  return new Promise(async function(resolve, reject) {
    const row_path = path.join(store_directory, 'tables/', table, id + '/');
    const raw = await fsp.readFile(row_path + id + '.json', 'utf8').catch(error => {
      reject(error);
    });
    const new_object = JSON.parse(raw);
    const keys = Object.keys(data);

    //// TODO options overwrite or something
    //// iterate through key-item pairs and add/replace new/modified pairs
    for (const item of keys) {
      new_object[item] = data[item];
    }

    //// write updated data to row file
    await fsp.writeFile(row_path + id + '.json', JSON.stringify(new_object)).catch(error => {
      reject(error);
    });

    resolve({ 'updated': id });

  });

};

//// function to return a row/entry from a table using the row's id
carDB.get_row = function(table, id) {

  return new Promise(async function(resolve, reject) {
    const row_path = path.join(store_directory, 'tables/', table, id + '/');
    const raw = await fsp.readFile(row_path + id + '.json', 'utf8').catch(error => {
      reject(error);
    });
    const new_object = JSON.parse(raw);

    resolve(new_object);
  });

};

//// function to create a new table
carDB.create_table = function(table) {

  return new Promise(async function(resolve, reject) {
    //// path to the item/file to be written
    const item_path = path.join(store_directory, 'tables/', table);

    //// make the folder 
    await fsp.mkdir(item_path).catch(error => {
      reject(error);
    });;

    resolve();

  });

};

//// function to return a list of all tables in the database
carDB.list_tables = function() {

  return new Promise(async function(resolve, reject) {
    ////path to the table folder
    const table_path = path.join(store_directory, 'tables/');

    //// read the table folder and get the file names
    fsp.readdir(table_path)
      .then(async function(files) {


        resolve(files);
      });

  });
};

//// function to return all rows/entries for a given table
carDB.get_all = function(table) {

  return new Promise(async function(resolve, reject) {
    ////path to the table folder
    const table_path = path.join(store_directory, 'tables/', table);

    //// read the table folder and get the file names
    fsp.readdir(table_path)
      .then(async function(files) {

        //// init an empty array
        let data = [];

        //// push all the parsed data from the files into the 'data' array
        await Promise.all(files.map(async (file) => {
          const row_path = path.join(table_path, file, file + '.json');
          const contents = await fsp.readFile(row_path, 'utf8');

          data.push(JSON.parse(contents));
        }));

        //// return the data array
        resolve(data);
      }).catch(error => {
        reject(error);
      });

  });

};

//// function to return all rows in a table in which include a given key/value pair
//// TODO: make this more robust
carDB.filter = function(table, key, value) {

  return new Promise(async function(resolve, reject) {
    const array = await carDB.get_all(table).catch(error => {
      reject(error);
    });

    const filtered = array.filter(function(item, index) {
      if (item[key] === value) {
        return true;
      }
      else {
        return false;
      }
    });

    resolve(filtered);
  });
};

//// function to delete a row in a table
carDB.delete_row = function(table, id) {

  return new Promise(async function(resolve, reject) {

    //// path to the row to be deleted
    const table_path = path.join(store_directory, 'tables/', table + '/', id + '/');

    //// test that the path exists with access, throw err if it doesn't
    fsp.access(table_path).then(async function(err) {
      if (err) {
        console.log(err);
        resolve(false);
      }
      else {

        //// unlink/delete the json file for the row
        await fsp.unlink(path.join(table_path, id + '.json'));

        //// delete the directory for the row
        await fsp.rmdir(table_path);

        resolve(true);

      }
    });
  });
};

// EXPORTS
module.exports = carDB;
