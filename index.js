// LIBRARIES

/// node/core libs
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;

/// vendor libs

/// app/local libs
const utils = require('./utils');

// APP

//// define path for storage
let store_directory;

if (process.env.NODE_ENV === 'test') {
  store_directory = path.join(__dirname, 'tests/fixtures/');
}
else {
  store_directory = path.join(process.cwd(), 'sketchdb_store/');
}

//// init sketchdb object for export
const sketchdb = {};

//// internal reference for store_directory path
sketchdb._store = store_directory;

//// function to insert a new row into a table
sketchdb.insert = function(table, id, data) {

  return new Promise(async function(resolve, reject) {
    //// path to the item/file to be written
    const row_path = path.join(store_directory, 'tables/', table, id + '.json');

    //// stringify the data
    const stringified = JSON.stringify(data);

    //// write the stringified data to a json file in the folder
    await fsp.writeFile(row_path, stringified, { flag: "wx" })
      .then(() => {
        resolve(true);
      }).catch(error => {
        reject(error);
      });

  });
};


//// function to update a row
sketchdb.update = function(table, id, data) {

  return new Promise(async function(resolve, reject) {
    const row_path = path.join(store_directory, 'tables/', table, id + '.json');
    
    const raw = await fsp.readFile(row_path, 'utf8').catch(error => {
      reject(error);
    });
 
    const new_object = JSON.parse(raw);
    
    //// extract the keys to use in the for of loop
    const keys = Object.keys(data);

    //// TODO options overwrite or something
    //// iterate through key-item pairs and add/replace new/modified pairs
    for (const item of keys) {
      new_object[item] = data[item];
    }

    //// write updated data to row file
    await fsp.writeFile(row_path, JSON.stringify(new_object)).catch(error => {
      reject(error);
    });

    resolve(true);

  });

};

//// function to return a row/entry from a table using the row's id
sketchdb.get_row = function(table, id) {

  return new Promise(async function(resolve, reject) {
    const row_path = path.join(store_directory, 'tables/', table, id + '.json');
    
    const raw = await fsp.readFile(row_path, 'utf8').catch(error => {
      reject(error);
    });
    
    const new_object = JSON.parse(raw);

    resolve(new_object);
  });

};

//// function to create a new table
sketchdb.create_table = function(table) {

  return new Promise(async function(resolve, reject) {
    //// path to the item/file to be written
    const item_path = path.join(store_directory, 'tables/', table);

    //// make the folder 
    await fsp.mkdir(item_path).catch(error => {
      reject(error);
    });;

    resolve(true);

  });

};

//// function to return a list of all tables in the database
sketchdb.list_tables = function() {

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
sketchdb.get_all = function(table) {

  return new Promise(async function(resolve, reject) {
    ////path to the table folder
    const table_path = path.join(store_directory, 'tables/', table);

    //// read the table folder and get the file names
    fsp.readdir(table_path)
      .then(async function(files) {

        //// init an empty array
        let data = [];

        //// push all the parsed data from the files into the 'data' array
        const build_data = files.map(async (file) => {
          const row_path = path.join(table_path, file);
          
          const contents = await fsp.readFile(row_path, 'utf8');

          data.push(JSON.parse(contents));
        })


        await Promise.all(build_data);

        //// return the data array
        resolve(data);
      }).catch(error => {
        reject(error);
      });

  });

};

//// function to return all rows in a table in which include a given key/value pair
//// TODO: make this more robust
sketchdb.filter = function(table, key, value) {

  return new Promise(async function(resolve, reject) {
    const array = await sketchdb.get_all(table).catch(error => {
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
sketchdb.delete_row = function(table, id) {

  return new Promise(async function(resolve, reject) {

    //// path to the row to be deleted
    const row_path = path.join(store_directory, 'tables/', table + '/', id + '.json');

    //// test that the path exists with access, throw err if it doesn't


    //// unlink/delete the json file for the row
    fsp.unlink(path.join(row_path))
      .then(() => resolve(true))
      .catch(error => {
        reject(error);
      });

  });
};


//// function to delete a row in a table
sketchdb.delete_table = function(table) {

  return new Promise(async function(resolve, reject) {

    //// path to the row to be deleted
    const table_path = path.join(store_directory, 'tables/', table + '/')

    fsp.rm(table_path, { recursive: true, force: true })
      .then(() =>
        resolve(true))
      .catch(error => {
        reject(error);
      })


  });
};


// EXPORTS
module.exports = sketchdb;
