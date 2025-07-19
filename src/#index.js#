//// LIBRARIES

/// node/core libs
import path from 'path';
import { promises as fsp } from 'fs';
import { fileURLToPath } from 'url';

/// app/local libs
import { gen_uid } from './utils.js';
import { path_exists } from '../src/utils.js';

//// APP

// __dirname shim for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// define path for storage
let store_directory;

// name for database storage directory
const directory_name = 'sketchdb_store';

// use tests/fixtures path when testing
if (process.env.NODE_ENV === 'test') {
  store_directory = path.join(__dirname, '/../tests/fixtures/');
} else {
  store_directory = path.join(process.cwd(), directory_name);
}

// init sketchdb object for export
const sketchdb = {};

// internal reference for store_directory path
sketchdb._set_path = function () {
  if (process.env.NODE_ENV === 'test') {
    store_directory = path.join(__dirname, '/../tests/fixtures/');
  } else {
    store_directory = path.join(process.cwd(), directory_name);
  }

  return store_directory;
};

// function to setup necessary directories for database storage
sketchdb.setup = async function () {
  sketchdb._set_path();

  const dir = path.resolve(store_directory);
  const tables_dir = path.resolve(store_directory, 'tables');

  await fsp.mkdir(dir, { recursive: true });
  await fsp.mkdir(tables_dir, { recursive: true });
};

// function to insert a new row into a table
sketchdb.insert = async function (...args) {
  sketchdb._set_path();

  let table, id, data;

  if (args.length === 2) {
    table = args[0];
    id = gen_uid();
    data = args[1];
  } else {
    table = args[0];
    id = args[1];
    data = args[2];
  }

  const table_path = path.join(store_directory, 'tables', table);
  const row_path = path.join(table_path, id + '.json');

  await fsp.writeFile(row_path, JSON.stringify(data), { flag: 'wx' });
  return id;
};

// function to update a row
sketchdb.update = async function (table, id, data) {
  const row_path = path.join(store_directory, 'tables', table, id + '.json');

  const raw = await fsp.readFile(row_path, 'utf8');
  const new_object = JSON.parse(raw);

  for (const key of Object.keys(data)) {
    new_object[key] = data[key];
  }

  await fsp.writeFile(row_path, JSON.stringify(new_object, null, 2));

  return true;
};

// function to return a row/entry from a table using the row's id
sketchdb.get_row = async function (table, id) {
  const row_path = path.join(store_directory, 'tables', table, id + '.json');
  const raw = await fsp.readFile(row_path, 'utf8');
  return JSON.parse(raw);
};

// function to create a new table
sketchdb.create_table = async function (table) {
  const item_path = path.join(store_directory, 'tables', table);

  try {
    await fsp.mkdir(item_path);
  } catch (err) {
    if (err.code === 'EEXIST') {
      throw new Error(`Table "${table}" already exists.`);
    }
    throw err;
  }

  return true;
};

// function to return a list of all tables in the database
sketchdb.list_tables = async function () {
  const tables_path = path.join(store_directory, 'tables');
  return await fsp.readdir(tables_path);
};

// function to return all rows/entries for a given table
sketchdb.get_all = async function (table) {
  const table_path = path.join(store_directory, 'tables', table);
  const files = await fsp.readdir(table_path);

  const data = await Promise.all(
    files.map(async (file) => {
      const contents = await fsp.readFile(path.join(table_path, file), 'utf8');
      return JSON.parse(contents);
    }),
  );

  return data;
};

// function to return all rows in a table in which include a given key/value pair
sketchdb.filter = async function (table, key, value) {
  const data = await sketchdb.get_all(table);
  return data.filter((item) => item[key] === value);
};

// function to delete a row in a table
sketchdb.delete_row = async function (table, id) {
  const row_path = path.join(store_directory, 'tables', table, id + '.json');
  await fsp.unlink(row_path);
  return true;
};

// function to move a row from one table to another
sketchdb.move_row = async function (from_table, to_table, id) {
  const from_path = path.join(
    store_directory,
    'tables',
    from_table,
    id + '.json',
  );
  const to_path = path.join(store_directory, 'tables', to_table, id + '.json');
  const data = await fsp.readFile(from_path, 'utf8');

  await fsp.writeFile(to_path, data, { flag: 'wx' });
  await fsp.unlink(from_path);

  return true;
};

// function to delete a table
sketchdb.delete_table = async function (table) {
  const table_path = path.join(store_directory, 'tables', table);

  // check if the table exists, throw an error if it doesn't
  const exists = await path_exists(table_path);
  if (!exists) {
    throw new Error(`Error - table ${table} does not exist!`);
  }

  await fsp.rm(table_path, { recursive: true, force: true });
  return true;
};

// function to get the results of two tables joined by a key index
sketchdb.eq_join = async function (table_1, table_2, key) {
  const table_1_data = await sketchdb.get_all(table_1);
  const table_2_data = await sketchdb.get_all(table_2);

  return table_1_data.map((item_1) => ({
    ...table_2_data.find((item_2) => item_2[key] === item_1[key]),
    ...item_1,
  }));
};

// function to rename a table
sketchdb.rename_table = async function (table, new_name) {
  const old_path = path.join(store_directory, 'tables', table);
  const new_path = path.join(store_directory, 'tables', new_name);

  await fsp.rename(old_path, new_path);
  return true;
};

// camelCase aliases
sketchdb.createTable = sketchdb.create_table;
sketchdb.listTables = sketchdb.list_tables;
sketchdb.getRow = sketchdb.get_row;
sketchdb.getAll = sketchdb.get_all;
sketchdb.deleteRow = sketchdb.delete_row;
sketchdb.deleteTable = sketchdb.delete_table;
sketchdb.renameTable = sketchdb.rename_table;
sketchdb.moveRow = sketchdb.move_row;

// EXPORTS
export default sketchdb;
