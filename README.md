# sketchdb

### About
This is a small file/directory based app for Node JS that provides some basic database functionality for storing key-value pairs in table/row/entry format as .json files. 

The purpose of this library is to provide a simple database-like storage system for things like small personal projects. It is written to be easy to setup and use.

External edits to directories and files in sketchdb_store will reflect in the database as long as they are proper JSON. 

This library requires no dependencies, and Jest is the only dev dependency.


### Installation

run 
```console
npm install sketchdb
```

in your project's directory to install a local node module.


## Usage

### Setup


run 
```console
npm exec sketchdb-setup
```

from the top level of your project directory to setup an instance of sketchdb. 

Alternatively, call sketchdb.setup() from inside a script (note - sketchdb.setup() is async and returns a promise) 

The setup application will create a new directory in that top level directory of the project named "sketchdb_store" where data will be stored, along with a subdirectory named "tables". (that's all sketchdb-setup does)


### API

All function calls to sketchdb return a Promise. 

Calls to retrieve data will resolve to that data or reject with an error. 

Calls to write data or perform a delete operation will resolve with true on success (this will probably change to an object of some sort with more info but haven't decided yet)


### Methods

- [sketchdb.list_tables](#list_tables)
- [sketchdb.create_table](#create_table)
- [sketchdb.insert](#insert)
- [sketchdb.get_row](#get_row)
- [sketchdb.get_all](#get_all)
- [sketchdb.update](#update)
- [sketchdb.delete_row](#delete_row)
- [sketchdb.delete_table](#delete_table)
- [sketchdb.filter](#filter)
- [sketchdb.rename_table](#rename_table)

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
    .then(function(results, error) {
        if (error) {
            //// handle the error
        }

        do_something_with_results();
        
        /*
        Results will be an array of the table names such as ["users","posts","authors"]
        */

    });
```

### <a name="create_table"></a> sketchdb.create_table
Creates a new table in the database.

**Syntax:** 
```javascript
sketchdb.create_table( 'table_name' )
```

**Parameters:** 

*table_name:* The name of the table to create (as a string)

**Return value:** Returns a Promise. When resolved, Promise returns true. On rejection, Promise returns the error.

**Example usage:** 
```javascript
sketchdb.create_table('users')
    .then(function(results, error) {
        if (error) {
            //// handle the error
        }

        success_function(results);
    });
```

**Note:** If you want to add tables to a project without writing functions to do so, you can create a subdirectory in "./sketchdb_store/tables/" with the name of the table you want to create. 
For example, making "./sketchdb_store/tables/users/" will create a "users" table in the schema.

### <a name="insert"></a> sketchdb.insert
Inserts a new row into a given table in the database.

**Syntax:** 
```javascript
sketchdb.insert( table_name, id,  data )
```
or if you want sketchdb to automatically generate a unique id, use: 

```javascript
sketchdb.insert( table_name, data )
```


**Parameters:** 

*id:* a string containing the id for the row. Must be unique to the table and valid as a directory name.

*table_name:* The name of the table to insert the row into. Table must already exist.

*data:* The data to be inserted. Will be written as a json file. Can be a JS object or valid JSON string.

**Return value:** Returns a Promise. When resolved, Promise returns the id of the new row.

**Example usage:** 

```javascript
const user_1 = {
    'name': 'John Smith',
    'group': '1"
}

const unique_id = 'uq13g564d';

const stringified = JSON.stringify(user_1);

sketchdb.insert('users', unique_id, stringified);
.then(function(results, error) {
    if (error) {
        //// handle the error
    }

    success_function(results);
});

```
or to use 2 arguments and have sketchDB generate a unique id for your row: 
```javascript
const user_1 = {
    'name': 'John Smith',
    'group': '1"
}

const stringified = JSON.stringify(user_1);

sketchdb.insert('users', stringified);
.then(function(results, error) {
    if (error) {
        //// handle the error
    }

    success_function(results);
});
```

### <a name="get_row"></a> sketchdb.get_row
Retrieves a row from a given table.

**Syntax:** 
```javascript
sketchdb.get_row( table_name, id )
```

**Parameters:** 

*table_name:* The name of the table the row belongs to.

*id:* a string containing the id for the row to retrieve. 


**Return value:** Returns a Promise. When resolved, Promise returns 

**Example usage:** 
```javascript
sketchdb.get_row('users', '178')
    .then(function(results, error) {
        if (error) {
            //// handle the error
        }

        success_function(results);
    });

```


### <a name="get_all"></a> sketchdb.get_all
Retrieves all rows from a given table as an array of objects.

**Syntax:** 
```javascript
sketchdb.get_all( table_name )
```

**Parameters:** 

*table_name:* The name of the table.

**Return value:** Returns a Promise. When resolved, Promise returns an array of objects (the data from each row). On rejection, Promise returns the error.

**Example usage:** 
```javascript
sketchdb.get_all('users')
    .then(function(results, error) {
        if (error) {
            //// handle the error
        }

        //// results will be an array of the row objects
        success_function(results);
    })
```

### <a name="update"></a> sketchdb.update
Updates a row with new and/or replacement data as key-value pairs of an object. 


**Syntax:** 
```javascript
sketchdb.update( id, table_name, data )
```

**Parameters:** 

*id:* a string containing the id for the row. Must be unique to the table and valid as a directory name.

*table_name:* The name of the table the row belongs to.

*data:* The data to be used to update the row. 

**Return value:** Returns a Promise. When resolved, Promise returns true. On rejection, Promise returns the error.

**Example usage:** 

```javascript
const user_1 = {
    'name': 'Bobby Knuckles',
    'group': '1'
}
const new_data = {
    'group': '2'
}
const unique_id = 'uq13g564d';

sketchdb.update("users", unique_id, new_data);
.then(function(results, error) {
    if (error) {
        //// handle the error
    }

    /* the updated row's object will look like :
        {
            'name':'Bobby Knuckles',
            'group': '2'
         }
       */

    success_function(results);
});

```


### <a name="delete_row"></a> sketchdb.delete_row
Deletes a row from a given table.

**Syntax:** 
```javascript
sketchdb.delete_row( table_name, id )
```

**Parameters:** 

*table_name:* The name of the table the row belongs to.

*id:* a string containing the id for the row to delete. 


**Return value:** Returns a Promise. When resolved, Promise returns true. On rejection, Promise returns the error.

**Example usage:** 
```javascript
sketchdb.delete_row('users', '178')
  .then(function(results, error) {
    if (error) {
      //// handle the error
    }

    success_function(results);
  })

```

### <a name="delete_table"></a> sketchdb.delete_table
Deletes a table and all contents (rows).

**Syntax:** 
```javascript
sketchdb.delete_table( table_name )
```

**Parameters:** 

table_name: The name of the table as a string.

**Return value:** Returns a Promise. When resolved, Promise returns true. On rejection, Promise returns the error.

**Example usage:** 
```javascript
sketchdb.delete_table('students')
  .then(function(result, error) {
    if (error) {
      //// handle the error
    }

    success_function();
  });
```

### <a name="filter"></a> sketchdb.filter
Return an array of any rows in a table that include a given key/value pair


**Syntax:** 
```javascript
sketchdb.filter( table_name, key, value )
```

**Parameters:** 

*table_name:* The name of the table the row belongs to.

*key:* The key (as a string) to be used to filter the rows by { *key* : value } 

*value:* The value (as a string) to be used to filter the rows by { key : *value* } 

**Return value:** Returns a Promise.  When resolved, Promise returns 

*Example usage:* 

```javascript
sketchdb.filter('users', 'group', 'superuser');
.then(function(results, error) {
  if (error) {
    //// handle the error
  }

  do_something_with_results();

  /*
       results will look something like:
       [{ 'username': 'user_1','group': 'superuser' }, {'username': 'user_3','group': 'superuser'}]
   
   */
});
```


### <a name="rename_table"></a> sketchdb.rename_table
Renames a table

**Syntax:** 
```javascript
sketchdb.rename_table( table, new_name )
```

**Parameters:** 

table: The name of the (old) table to be renamed (as a string).
new_name: The new name for the table (as a string).

**Return value:** Returns a Promise. When resolved, Promise returns true. On rejection, Promise returns the error.

**Example usage:** 
```javascript
sketchdb.rename_table('authors', 'contributors')
  .then(function(result, error) {
    if (error) {
      //// handle the error
    }

    success_function();
  });
```
