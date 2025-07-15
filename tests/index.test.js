/* global expect beforeAll afterAll */

//// LIBRARIES

/// node/core libs
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

/// app/local libs
const sketchdb = require('../src/index.js');
const utils = require('../src/utils.js');

//// APP

/// Paths and directory names
const fixtures_path = path.join(__dirname, '/fixtures/');
const tables_path = path.join(fixtures_path, '/tables/');
const static_path = path.resolve(fixtures_path, 'static/');

const table_1 = "posts";
const table_2 = "authors";
const table_3 = "users";

const table_1_path = path.join(tables_path, table_1);
const table_2_path = path.join(tables_path, table_2);
const table_3_path = path.join(tables_path, table_3);

const path_exists = utils.path_exists;

/// Data fixtures
const data_1 = { title: "mauris sit amet", author: "Basia Neal", date: "Nov 27, 2022" };
const data_2 = { title: "sociosqu ad litora", author: "Steven Burks", date: "Nov 8, 2021" };
const data_3 = { title: "erat. Vivamus nisi.", author: "Aline Love", date: "Nov 12, 2022" };
const data_3_update_1 = { date: "Nov 14, 2022" };
const data_3_2 = { title: "erat. Vivamus nisi.", author: "Aline Love", date: "Nov 14, 2022" };
const data_3_update_2 = { coauthor: "Ben Bates" };
const data_3_3 = { title: "erat. Vivamus nisi.", author: "Aline Love", date: "Nov 14, 2022", coauthor: "Ben Bates" };
const data_4 = { name: "Aline Love", email: "alinelove@gmail.com", group: "1" };
const data_5 = { name: "Ben Bates", email: "ben.bates@gmail.com", group: "2" };
const data_6 = { name: "Basia Neal", email: "basiag.neal@gmail.com", group: "2" };
const data_7 = [data_4, data_5, data_6];

let uid;


/// Tests

test(`Test environment variables are setup`, () => {
  expect(process.env.NODE_ENV).toBe('test');

  expect(sketchdb._set_path()).toBe(fixtures_path);
});

test(`sketchdb.list_tables returns an array of the table names`, async () => {

  const expected_array = [table_1, table_2];
  const recieved_array = await sketchdb.list_tables();

  expect(recieved_array.length).toEqual(expected_array.length);

  expect(recieved_array).toEqual(expect.arrayContaining(recieved_array));
});

test(`sketchdb.create_table creates a table`, async () => {
  await sketchdb.create_table(table_3);

  const stat = await fsp.stat(path.join(tables_path, table_3));
  const _tables = await sketchdb.list_tables();

  expect(stat.isDirectory()).toBe(true);

  expect(_tables).toContain(table_3);
});

test(`sketchdb.create_table rejects if given a duplicate table name`, async () => {
  const create_call = sketchdb.create_table(table_1);

  expect(create_call).rejects.toThrow();
});

test(`sketchdb.insert (with 3 arguments) inserts an object into new row`, async () => {
  await sketchdb.insert(table_1, 2, data_2);


  const retrieved_row = await sketchdb.get_row(table_1, 2);

  expect(retrieved_row).toEqual(data_2);
});


test(`sketchdb.insert (with 2 arguments) inserts an object into new row`, async () => {
    uid = await sketchdb.insert(table_1, data_2);

    const retrieved_row = await sketchdb.get_row(table_1, 2);

    console.log('unique ID:', uid);

    expect(retrieved_row).toEqual(data_2);
});


test(`sketchdb.insert rejects if given a duplicate row id`, async () => {
  const insert_call = sketchdb.insert(table_1, 1, data_1);

  expect(insert_call).rejects.toThrow();
});


test('sketchdb.insert retries when a generated ID already exists', async () => {
  const originalGenUid = utils.gen_uid;

  // Create a fake ID to simulate collision
  const fakeId = 'fake_id_collision';
  let callCount = 0;

  // Monkey-patch the gen_uid function
  utils.gen_uid = () => {
    callCount++;
    return callCount === 1 ? fakeId : originalGenUid();
  };

  // Insert a row manually with the fake ID
  await sketchdb.insert(table_3, fakeId, { test: 'original' });

  // Now use insert() with 2 args — this should trigger a retry
  const newId = await sketchdb.insert(table_3, { test: 'retry' });

  expect(newId).not.toBe(fakeId);

  const original = await sketchdb.get_row(table_3, fakeId);
  const retried = await sketchdb.get_row(table_3, newId);

  expect(original).toEqual({ test: 'original' });
  expect(retried).toEqual({ test: 'retry' });

  // Restore the original gen_uid
  utils.gen_uid = originalGenUid;
});


test(`sketchdb.update modifies a key value pair in a row`, async () => {
  await sketchdb.update(table_1, 1, data_3_update_1);

  const retrieved_row = await sketchdb.get_row(table_1, 1);

  expect(retrieved_row).toEqual(data_3_2);
});

test(`sketchdb.update can add a new key-value pair`, async () => {
  await sketchdb.update(table_1, 1, data_3_update_2);

  const retrieved_row = await sketchdb.get_row(table_1, 1);

  expect(retrieved_row).toEqual(data_3_3);
});

test(`sketchdb.get_row returns a row's data`, async () => {
  const retrieved_row = await sketchdb.get_row(table_1, 2);

  expect(retrieved_row).toEqual(data_2);
});

test(`sketchdb.get_row using uid returns the correct row's data`, async () => {
  const retrieved_row = await sketchdb.get_row(table_1, uid);

  expect(retrieved_row).toEqual(data_2);
});


test(`sketchdb.get_all returns all of a table's data`, async () => {
  const retrieved_row = await sketchdb.get_all(table_2);

  expect(retrieved_row).toEqual(data_7);
});

test(`sketchdb.get_all rejects if given an incorrect table name`, async () => {
  const retrieved_row = sketchdb.get_all('incorrect_table');

  expect(retrieved_row).rejects.toThrow();
});

test(`sketchdb.delete_row deletes a row directory/file`, async () => {
  await sketchdb.delete_row(table_1, 3);

  const exists = await path_exists(path.resolve(table_1_path, '3/'));

  expect(exists).toBe(false);
});

test(`sketchdb.filter return rows containing a given key-value pair`, async () => {
  const retrieved_row = await sketchdb.filter(table_2, "group", "2");

  expect(retrieved_row).toEqual([data_5, data_6]);
});


test(`sketchdb.delete_table deletes a table's directories/files`, async () => {
  await sketchdb.delete_table(table_1);

  const exists = await path_exists(table_1_path);

  expect(exists).toBe(false);
});

test(`sketchdb.rename_table renames a table directory`, async () => {
  await sketchdb.rename_table(table_2, 'renamed');

  const exists = await path_exists(path.join(tables_path, 'renamed'));

  expect(exists).toBe(true);
});

test('sketchdb.move_row moves a row from one table to another', async () => {
  const id = 'movetest_1';
  const rowData = { title: 'Move Me', author: 'Mover' };

  // Ensure both tables exist
  await sketchdb.create_table('from_table');
  await sketchdb.create_table('to_table');

  // Insert row into source table
  await sketchdb.insert('from_table', id, rowData);

  // Verify row exists in source
  let original = await sketchdb.get_row('from_table', id);
  expect(original).toEqual(rowData);

  // Move the row
  await sketchdb.move_row('from_table', 'to_table', id);

  // Confirm it's removed from source
  await expect(sketchdb.get_row('from_table', id)).rejects.toThrow();

  // Confirm it's present and correct in destination
  const moved = await sketchdb.get_row('to_table', id);
  expect(moved).toEqual(rowData);
});




/// Teardown and Setup


afterAll(async () => {
  // Clean up any dynamically created tables
  await fsp.rm(tables_path, { recursive: true, force: true });
  await fsp.cp(static_path, tables_path, { recursive: true });
});

