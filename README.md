# sketchDB

### About
This is a small file/directory based CRUD app for Node JS that provides some basic database functionality for storing key-value pairs.

The purpose of this library is to provide a simple database-like storage system for things like small personal projects. It is written to be easy to setup and use.


*Note: This library is currently in a Zero-version and the API may change.* 


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

from the top level of your project directory to setup an instance of sketchDB. 

The setup application will create a new directory in that top level directory of the project called "sketchDB_store" where data will be stored.


### API

All function calls to sketchDB return a Promise. 

Calls to retrieve data will resolve to that data or reject with an error. 

Calls to write data or perform a delete operation will resolve with true on success (this will probably change to an object of some sort with more info but haven't decided yet)


### Methods


- [sketchDB.create_table](#create_table)
- [sketchDB.insert](#insert)
- [sketchDB.get_row](#get_row)
- [sketchDB.get_all](#get_all)
- [sketchDB.update](#update)
- [sketchDB.delete_row](#delete_row)
- [sketchDB.delete_table](#delete_table)
- [sketchDB.filter](#filter)


### <a name="create_table"></a> sketchDB.create_table
Creates a new table in the database.

**Syntax:** 
```javascript
sketchDB.create_table( 'table_name' )
```

**Parameters:** table_name: The name of the table to create (as a string)

**Return value:** Returns a Promise. When resolved, Promise returns 

**Example usage:** 
```javascript
sketchDB.create_table('users')
  .then(function(results, error) {
    if (error) {
      //// handle the error
    }
    
    success_function(results);
  });
```

### <a name="insert"></a> sketchDB.insert
Inserts a new row into a given table in the database.

**Syntax:** 
```javascript
sketchDB.insert( id, table_name, data )
```

**Parameters:** 
id: a string containing the id for the row. Must be unique to the table and valid as a directory name.
table_name: The name of the table to insert the row into. Table must already exist.
data: The data to be inserted. Will be written as a json file. Can be a JS object or valid JSON string.

**Return value:** Returns a Promise. When resolved, Promise returns 

**Example usage:** 

```javascript
const user_1 = {
    'name':'Bobby Knuckles',
    'group': '1"
}

const unique_id = 'uq13g564d'

const stringified = JSON.stringify(user_1)

sketchDB.insert('users', unique_id, stringified);
    .then(function(results, error) {
        if (error) {
            //// handle the error
        }
    
    success_function(results);
  });
```

### <a name="get_row"></a> sketchDB.get_row
Retrieves a row from a given table.

**Syntax:** 
```javascript
sketchDB.get_row( table_name, id )
```

**Parameters:** 
table_name: The name of the table the row belongs to.
id: a string containing the id for the row to retrieve. 


**Return value:** Returns a Promise. When resolved, Promise returns 

**Example usage:** 
```javascript
sketchDB.get_row('users', '178')
  .then(function(results, error) {
    if (error) {
      //// handle the error
    }
    
    success_function(results);
  });
```


### <a name="get_all"></a> sketchDB.get_all
Retrieves all rows from a given table as an array of objects.

**Syntax:** 
```javascript
sketchDB.get_all( table_name )
```

**Parameters:** 
table_name: The name of the table.

**Return value:** Returns a Promise. When resolved, Promise returns 

**Example usage:** 
```javascript
sketchDB.get_all('users')
  .then(function(results, error) {
    if (error) {
      //// handle the error
    }
    
    //// results will be an array of the row objects
    success_function(results);
  });
```

### <a name="update"></a> sketchDB.update
Updates a row with new and/or replacement data as key-value pairs of an object. 


**Syntax:** 
```javascript
sketchDB.update( id, table_name, data )
```

**Parameters:** 

*id:* a string containing the id for the row. Must be unique to the table and valid as a directory name.

*table_name:* The name of the table the row belongs to.

*data:* The data to be used to update the row. 

**Return value:** Returns a Promise.  When resolved, Promise returns an object formatted like: 
```javascript
{ 'updated': id, 'table': table_name }
```

**Example usage:** 

```javascript
const user_1 = {
    'name':'Bobby Knuckles',
    'group': '1'
}
const new_data = {
    'group': '2'
}
const unique_id = 'uq13g564d'

sketchDB.update("users", unique_id, new_data);
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


### <a name="delete_row"></a> sketchDB.delete_row
Deletes a row from a given table.

**Syntax:** 
```javascript
sketchDB.delete_row( table_name, id )
```

**Parameters:** 
table_name: The name of the table the row belongs to.
id: a string containing the id for the row to delete. 


**Return value:** Returns a Promise. When resolved, Promise returns an object formatted like: 
```javascript
{ 'deleted': id, 'table': table_name }
```


**Example usage:** 
```javascript
sketchDB.delete_row('users', '178')
  .then(function(results, error) {
    if (error) {
      //// handle the error
    }
    
    success_function(results);
  });
```

### <a name="delete_table"></a> sketchDB.delete_table
Deletes a table and all contents (rows).

**Syntax:** 
```javascript
sketchDB.delete_table( table_name )
```

**Parameters:** 
table_name: The name of the table as a string.

**Return value:** Returns a Promise. When resolved, Promise returns true.

```


**Example usage:** 
```javascript
sketchDB.delete_table('students')
  .then(function(result, error) {
    if (error) {
      //// handle the error
    }
    
    success_function();
  });
```

### <a name="filter"></a> sketchDB.filter
Updates a row with new and/or replacement data as key-value pairs of an object. 


**Syntax:** 
```javascript
sketchDB.update( id, table_name, data )
```

**Parameters:** 

***id:*** a string containing the id for the row. Must be unique to the table and valid as a directory name.

***table_name:*** The name of the table the row belongs to.

***data:*** The data to be used to update the row. 

**Return value:** Returns a Promise.  When resolved, Promise returns an object formatted like: 
```javascript
{ 'updated': id, 'table': table_name }
```

**Example usage:** 

```javascript
const user_1 = {
    'name':'Bobby Knuckles',
    'group': '1'
}
const new_data = {
    'group': '2'
}
const unique_id = 'uq13g564d'

sketchDB.update("users", unique_id, new_data);
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

