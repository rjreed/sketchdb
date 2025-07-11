// LIBRARIES

/// node/core libs
const path = require('path');
const fsp = require('fs').promises;

/// vendor libs

/// app/local libs

// APP

//// define path for storage
let store_directory;

//// name for database storage directory
const directory_name = 'sketchdb_store';

//// use tests/fixtures path when testing
if (process.env.NODE_ENV === 'test') {
  store_directory = path.join(__dirname, '/../tests/fixtures/');
}
else {
  store_directory = path.join(process.cwd(), directory_name);
}

//// init sketchdb object for export
const sketchdb = {};

//// utility function to generate unique IDs
function gen_uid() {
    //// base36 timestamp
    const timestamp = Date.now().toString(36); 
    //// random string
    const random = Math.random().toString(36).substring(2, 8); 

    return `${timestamp}_${random}`;
}

//// internal reference for store_directory path
sketchdb._set_path = function() {
  if (process.env.NODE_ENV === 'test') {
    store_directory = path.join(__dirname, '/../tests/fixtures/');
  }
  else {
    store_directory = path.join(process.cwd(), directory_name);
  }

  return store_directory;
};

//// function to setup necessary directories for database storage
sketchdb.setup = function() {

  sketchdb._set_path();

  return new Promise(async function(resolve, reject) {

    //// path used to create the database storage directory
    const directory = path.resolve(store_directory);
    const tables_directory = path.resolve(store_directory, 'tables/');

    //// create the database directory
    fsp.mkdir(directory).then(function(error) {

      if (error) {
        reject(error);
      }

      //// create the tables directory
      fsp.mkdir(tables_directory).then(function(error) {

        //// does this count as error handling
        if (error) {
          reject(error);
        }

        //// resolve when completed
        resolve();
      });
    });
  });
}


//// function to insert a new row into a table
sketchdb.insert = function(...args) {
  let table, id, data;

  if (args.length === 2) {
      table = args[0];
      id = gen_uid();
      data = args[1];

  } else {
      table = args[0];
      id =args[1];
      data = args[2];
  };

  sketchdb._set_path();

  return new Promise(async (resolve, reject) => {

    //// path to the item/file to be written
    const row_path = path.join(store_directory, 'tables/', table, id + '.json');

    //// stringify the data
    const stringified = JSON.stringify(data);

    //// write the stringified data to a json file in the folder
    await fsp.writeFile(row_path, stringified, { flag: "wx" })
      .then(() => {
        resolve(id);
      }).catch(error => {
        reject(error);
      });

  });
};


//// function to update a row
sketchdb.update = function(table, id, data) {

  sketchdb._set_path();

  return new Promise(async (resolve, reject) => {

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

  sketchdb._set_path();

  return new Promise(async (resolve, reject) => {
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

  sketchdb._set_path();

  return new Promise(async (resolve, reject) => {
    //// path to the item/file to be written
    const item_path = path.join(store_directory, 'tables/', table);

    //// make the folder 
    await fsp.mkdir(item_path).catch(error => {
      reject(error);
    });

    resolve(true);

  });

};

//// function to return a list of all tables in the database
sketchdb.list_tables = function() {

  sketchdb._set_path();

  return new Promise(async (resolve, reject) => {
    ////path to the table folder
    const table_path = path.join(store_directory, 'tables/');

    //// read the table folder and get the file names
    fsp.readdir(table_path)
      .then(async function(files) {

        //// return the array of filenames
        resolve(files);
      });

  });
};

//// function to return all rows/entries for a given table
sketchdb.get_all = function(table) {

  sketchdb._set_path();

  return new Promise(async (resolve, reject) => {
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

          //// push the object to the data array
          data.push(JSON.parse(contents));
        })

        //// Promise.all the async read funtions
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

  sketchdb._set_path();

  return new Promise(async (resolve, reject) => {

    //// retrieve all rows in the given table using get_all
    const array = await sketchdb.get_all(table).catch(error => {
      reject(error);
    });

    //// filter the items based on the provided key/value pair
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

  return new Promise(async (resolve, reject) => {

    //// path to the row to be deleted
    const row_path = path.join(store_directory, 'tables/', table + '/', id + '.json');

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

  sketchdb._set_path();

  return new Promise(async (resolve, reject) => {

    //// path to the row to be deleted
    const table_path = path.join(store_directory, 'tables/', table + '/');

    //// delete the directory and contents
    fsp.rm(table_path, { recursive: true, force: true })
      .then(() =>
        resolve(true))
      .catch(error => {
        reject(error);
      });

  });
};


sketchdb.eq_join = function(table_1, table_2, key) {

  sketchdb._set_path();

  return new Promise(async (resolve, reject) => {
    const table_1_data = await sketchdb.get_all(table_1);
    const table_2_data = await sketchdb.get_all(table_2);

    const join = (array_1, array_2) =>
      array_1.map(item_1 => ({
        ...array_2.find((item_2) => (item_2[key] === item_1[key])),
        ...item_1
      }));
    const results = join(table_1_data, table_2_data);

    resolve(results);
  });
};

// function to rename a table
sketchdb.rename_table = function(table, new_name) {

  sketchdb._set_path();

  return new Promise(async (resolve, reject) => {

    //// paths to old table and new table 
    const old_path = path.join(store_directory, 'tables/', table + '/');
    const new_path = path.join(store_directory, 'tables/', new_name + '/');

    //// call fsp.rename with paths
    fsp.rename(old_path, new_path)
      .then(() =>
        resolve(true))
      .catch(error => {
        reject(error);
      });

  });

};

// EXPORTS
module.exports = sketchdb;
