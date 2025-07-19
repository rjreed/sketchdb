//// LIBRARIES
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { promises as fsp } from 'node:fs';
import { fileURLToPath } from 'node:url';

import sketchdb from '../src/index.js';
import { path_exists } from '../src/utils.js';

import * as fixtures from './fixtures/data.js';

//// APP

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fixtures_path = path.join(__dirname, 'fixtures');
const tables_path = path.join(fixtures_path, 'tables');
const static_path = path.join(fixtures_path, 'static');

const table_1 = 'posts';
const table_2 = 'authors';
const table_3 = 'users';
const table_1_path = path.join(tables_path, table_1);
const table_2_path = path.join(tables_path, table_2);
const table_3_path = path.join(tables_path, table_3);

let uid;

before(async () => {
  process.env.NODE_ENV = 'test';
  sketchdb._set_path();
});

test('Test environment variables are setup', async () => {
  assert.equal(process.env.NODE_ENV, 'test');
  assert.strictEqual(
    path.resolve(sketchdb._set_path()),
    path.resolve(path.join(process.cwd(), 'tests', 'fixtures')),
  );
});
test('sketchdb.list_tables returns an array of the table names', async () => {
  const expected_array = [table_1, table_2];
  const received_array = await sketchdb.list_tables();
  assert.equal(received_array.length, expected_array.length);
  expected_array.forEach((e) => assert(received_array.includes(e)));
});

test('sketchdb.create_table creates a table', async () => {
  await sketchdb.create_table(table_3);
  const stat = await fsp.stat(path.join(tables_path, table_3));
  const _tables = await sketchdb.list_tables();
  assert(stat.isDirectory());
  assert(_tables.includes(table_3));
});

test('sketchdb.create_table rejects if given a duplicate table name', async () => {
  await assert.rejects(() => sketchdb.create_table(table_1));
});

test('sketchdb.insert (with 3 arguments) inserts an object into new row', async () => {
  await sketchdb.insert(table_1, 2, fixtures.data_2);
  const retrieved_row = await sketchdb.get_row(table_1, 2);
  assert.deepEqual(retrieved_row, fixtures.data_2);
});

test('sketchdb.insert (with 2 arguments) inserts an object into new row', async () => {
  uid = await sketchdb.insert(table_1, fixtures.data_2);
  const retrieved_row = await sketchdb.get_row(table_1, 2);
  assert.deepEqual(retrieved_row, fixtures.data_2);
});

test('sketchdb.insert rejects if given a duplicate row id', async () => {
  await assert.rejects(() => sketchdb.insert(table_1, 1, fixtures.data_1));
});

test('sketchdb.update modifies a key value pair in a row', async () => {
  await sketchdb.update(table_1, 1, fixtures.data_3_update_1);
  const retrieved_row = await sketchdb.get_row(table_1, 1);
  assert.deepEqual(retrieved_row, fixtures.data_3_2);
});

test('sketchdb.update can add a new key-value pair', async () => {
  await sketchdb.update(table_1, 1, fixtures.data_3_update_2);
  const retrieved_row = await sketchdb.get_row(table_1, 1);
  assert.deepEqual(retrieved_row, fixtures.data_3_3);
});

test('sketchdb.update rejects if given an invalid row id', async () => {
  await assert.rejects(
    () => sketchdb.update('posts', 'this_id_does_not_exist', { title: 'fail' }),
    Error,
  );
});

test("sketchdb.get_row returns a row's data", async () => {
  const retrieved_row = await sketchdb.get_row(table_1, 2);
  assert.deepEqual(retrieved_row, fixtures.data_2);
});

test("sketchdb.get_row using uid returns the correct row's data", async () => {
  const retrieved_row = await sketchdb.get_row(table_1, uid);
  assert.deepEqual(retrieved_row, fixtures.data_2);
});

test('sketchdb.get_row rejects if given an invalid row id', async () => {
  await assert.rejects(
    () => sketchdb.get_row('posts', 'this_id_does_not_exist'),
    Error,
  );
});

test("sketchdb.get_all returns all of a table's data", async () => {
  const retrieved_row = await sketchdb.get_all(table_2);
  assert.deepEqual(retrieved_row, fixtures.data_7);
});

test('sketchdb.get_all rejects if given an incorrect table name', async () => {
  await assert.rejects(() => sketchdb.get_all('incorrect_table'));
});

test('sketchdb.delete_row deletes a row directory/file', async () => {
  await sketchdb.delete_row(table_1, 3);
  const exists = await path_exists(path.resolve(table_1_path, '3.json'));
  assert.strictEqual(exists, false);
});

test('sketchdb.delete_row rejects if given an invalid row id', async () => {
  await assert.rejects(
    () => sketchdb.delete_row('posts', 'this_id_does_not_exist'),
    Error,
  );
});

test('sketchdb.filter return rows containing a given key-value pair', async () => {
  const retrieved_row = await sketchdb.filter(table_2, 'group', '2');
  assert.deepEqual(retrieved_row, [fixtures.data_5, fixtures.data_6]);
});

test('sketchdb.filter rejects if given an invalid table name', async () => {
  await assert.rejects(
    () =>
      sketchdb.filter('this_table_does_not_exist', 'some_key', 'some_value'),
    Error,
  );
});

test("sketchdb.delete_table deletes a table's directories/files", async () => {
  await sketchdb.delete_table(table_1);
  const exists = await path_exists(table_1_path);
  assert.strictEqual(exists, false);
});

test('sketchdb.delete_table rejects if given an invalid table name', async () => {
  await assert.rejects(
    () => sketchdb.delete_table('this_table_does_not_exist'),
    Error,
  );
});

test('sketchdb.rename_table renames a table directory', async () => {
  await sketchdb.rename_table(table_2, 'renamed');
  const exists = await path_exists(path.join(tables_path, 'renamed'));
  assert.strictEqual(exists, true);
});

test('sketchdb.rename_table rejects if given an invalid table name', async () => {
  await assert.rejects(
    () => sketchdb.rename_table('this_table_does_not_exist', 'new_table_name'),
    Error,
  );
});

test('sketchdb.move_row moves a row from one table to another', async () => {
  const id = 'movetest_1';
  const rowData = { title: 'Move Me', author: 'Mover' };

  await sketchdb.create_table('from_table');
  await sketchdb.create_table('to_table');

  await sketchdb.insert('from_table', id, rowData);

  const original = await sketchdb.get_row('from_table', id);
  assert.deepEqual(original, rowData);

  await sketchdb.move_row('from_table', 'to_table', id);

  await assert.rejects(() => sketchdb.get_row('from_table', id));
  const moved = await sketchdb.get_row('to_table', id);
  assert.deepEqual(moved, rowData);
});

test('sketchdb.move_row rejects if given an invalid row id', async () => {
  await assert.rejects(
    () => sketchdb.move_row('posts', 'authors', 'this_id_does_not_exist'),
    Error,
  );
});

// Teardown
after(async () => {
  await fsp.rm(tables_path, { recursive: true, force: true });
  await fsp.cp(static_path, tables_path, { recursive: true });
});
