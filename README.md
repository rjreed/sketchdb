# sketchdb

## About

This is a small file/directory based app for Node JS that provides some basic database functionality for storing key-value pairs in table/row/entry format as .json files.

The purpose of this library is to provide a simple database-like storage system for things like small personal projects or prototyping. It is written to be easy to setup and use.

This library requires no dependencies.

# Installation

Note: sketchdb requires Node.js v18 or higher.

## Download 
run

```console
npm install sketchdb
```



in your project's directory to install a local node module.

## Setup

run

```console
npm exec sketchdb-setup
```

from the top level of your project directory to setup an instance of sketchdb.

Alternatively, call sketchdb.setup() from inside a script (note - sketchdb.setup() is async and returns a promise)

The setup application will create a new directory in that top level directory of the project named "sketchdb_store" where data will be stored, along with a subdirectory named "tables". (That's all sketchdb-setup does)

External edits to directories and files in sketchdb_store will reflect in the database as long as they are proper JSON.

# Usage

## API

All function calls to sketchdb return a Promise.

Calls to retrieve data will resolve to that data or reject with an error.

Calls to write data or perform a delete operation will resolve with true on success (this will probably change to an object of some sort with more info but haven't decided yet)

## Methods

* [sketchdb.list_tables](#list_tables)
* [sketchdb.create_table](#create_table)
* [sketchdb.insert](#insert)
* [sketchdb.get_row](#get_row)
* [sketchdb.get_all](#get_all)
* [sketchdb.update](#update)
* [sketchdb.delete_row](#delete_row)
* [sketchdb.delete_table](#delete_table)
* [sketchdb.filter](#filter)
* [sketchdb.rename_table](#rename_table)

### CamelCase Aliases

For your convenience, all main API functions in sketchdb are available in both `snake_case` and `camelCase` formats. You can use whichever naming style fits your project best—they are fully interchangeable.

**Examples:**

```js
sketchdb.createTable = sketchdb.create_table;
sketchdb.listTables = sketchdb.list_tables;
sketchdb.getRow = sketchdb.get_row;
sketchdb.getAll = sketchdb.get_all;
sketchdb.deleteRow = sketchdb.delete_row;
sketchdb.deleteTable = sketchdb.delete_table;
sketchdb.renameTable = sketchdb.rename_table;
sketchdb.moveRow = sketchdb.move_row;
sketchdb.insert 
sketchdb.update 
```

***

### <a name="list_tables"></a> sketchdb.list_tables

List the tables in the database in array format.

**Syntax:**

```javascript
sketchdb.list_tables()
```

**Parameters:**

none

**Return value:** Returns a Promise. When resolved, Promise returns an array of the table names as strings.

**Example usage:**

```javascript
sketchdb.list_tables()
  .then(function(results) {
    do_something_with_results(results);
    // Results will be an array like ["users","posts","authors"]
  });
```
***

### <a name="create_table"></a> sketchdb.create_table

Creates a new table in the database.

**Syntax:**

```javascript
sketchdb.create_table('table_name')
```

**Parameters:**

*table_name:* The name of the table to create (as a string)

**Return value:** Returns a Promise. Resolves with true. Rejects with an error if the table exists.

**Example usage:**

```javascript
sketchdb.create_table('users')
  .then(success_function)
  .catch(error_handler);
```

**Note:** You can also create a table by making a subdirectory in "./sketchdb_store/tables/" with the table name.

***

### <a name="insert"></a> sketchdb.insert

Insert a new row into a given table in the database.

**Syntax:**

```javascript
sketchdb.insert(table_name, id, data)
```

Or let sketchdb generate a unique id:

```javascript
sketchdb.insert(table_name, data)
```

**Parameters:**

* *table_name* (string): Table to insert into.
* *id* (string, optional): Unique row id. (Optional, will auto-generate if omitted)
* *data* (object or JSON string): Data to store as JSON.

**Return value:** Returns a Promise. Resolves with the id.

**Example usage:**

```javascript
const user = { name: 'John', group: '1' };
sketchdb.insert('users', user)
  .then(function(id) {
    // use the returned unique id
  });
```
or

```javascript
const id = '1234'
const user = { name: 'John', group: '1' };
sketchdb.insert('users', id, user)
  .then(function(id) {
    // do something next, id is the given id
  });
```

***

### <a name="get_row"></a> sketchdb.get_row

Retrieve a row from a given table.

**Syntax:**

```javascript
sketchdb.get_row(table_name, id)
```

**Parameters:**

* *table_name* (string): Table name
* *id* (string): Row id

**Return value:** Resolves to the data object for the row, or rejects if not found.

**Example usage:**

```javascript
sketchdb.get_row('users', '178')
  .then(user => {
  // Do something with the user data
  console.log('User name:', user.name);
  console.log('User group:', user.group);
  })
  .catch(error => {
  // Handle the error
  console.error('Error fetching row:', error.message);
  });
```

***

### <a name="get_all"></a> sketchdb.get_all

Retrieve all rows from a given table as an array.

**Syntax:**

```javascript
sketchdb.get_all(table_name)
```

**Return value:** Resolves to an array of row objects. Rejects if table not found.

**Example usage:**

```javascript
sketchdb.get_all('users')
  .then(users => {
  //do something with the users array
  handle_users(users);
   })
  .catch(handle_error);
```

***

### <a name="update"></a> sketchdb.update

Update a row with new or replacement data.

**Syntax:**

```javascript
sketchdb.update(table_name, id, data)
```

**Parameters:**

* *table_name* (string): Table name
* *id* (string): Row id
* *data* (object): Data to merge/update

**Return value:** Resolves with true on success, rejects on error.

**Example usage:**

```javascript
sketchdb.update('users', 'uq13g564d', { group: '2' })
  .then(success_function)
  .catch(handle_error);
```

***

### <a name="delete_row"></a> sketchdb.delete_row

Delete a row from a table.

**Syntax:**

```javascript
sketchdb.delete_row(table_name, id)
```

**Return value:** Resolves with true on success.

**Example usage:**

```javascript
sketchdb.delete_row('users', '178')
  .then(success_function)
  .catch(handle_error);
```

***

### <a name="delete_table"></a> sketchdb.delete_table

Delete an entire table and its rows.

**Syntax:**

```javascript
sketchdb.delete_table(table_name)
```

**Return value:** Resolves with true on success.

**Example usage:**

```javascript
sketchdb.delete_table('students')
  .then(success_function)
  .catch(handle_error);
```

***

### <a name="filter"></a> sketchdb.filter

Return an array of all rows in a table with a given key/value pair.

**Syntax:**

```javascript
sketchdb.filter(table_name, key, value)
```

**Return value:** Resolves to array of row objects with matching key/value.

**Example usage:**

```javascript
sketchdb.filter('users', 'group', 'superuser')
  .then(users => {
  // Do something with the array of objects
  handle_users_array(users);
  })
  .catch(error => {
  // Handle the error
  console.error('Error fetching array:', error.message);
  });
```

***

### <a name="rename_table"></a> sketchdb.rename_table

Rename a table.

**Syntax:**

```javascript
sketchdb.rename_table(table, new_name)
```

**Return value:** Resolves with true on success.

**Example usage:**

```javascript
sketchdb.rename_table('authors', 'contributors')
  .then(success_function)
  .catch(handle_error);
```

***

### <a name="move_row"></a> sketchdb.move_row

Move a row from one table to another (retaining the same row id).

**Syntax:**

```javascript
sketchdb.move_row(from_table, to_table, id)
```

**Parameters:**

* *from_table* (string): The table to move the row **from**
* *to_table* (string): The table to move the row **to**
* *id* (string): The id of the row to move

**Return value:** Resolves with true on success. Rejects with an error if the source row does not exist, or the destination already has the id.

**Example usage:**

```javascript
sketchdb.move_row('drafts', 'posts', '12345')
  .then(() => console.log('Row moved!'))
  .catch(handle_error);
```

***
