#!/usr/bin/env node

// LIBRARIES

/// node/core libs
const fsp = require('fs').promises;
const path = require('path');

/// app/local libs
const sketchDB = require('./index.js');


// APP 

//// name for database storage directory
const directory_name = 'sketchDB_store'

//// function to setup necessary directories for database storage
function setup() {

  return new Promise(async function(resolve, reject) {

    //// path used to create the database storage directory
    const directory = path.resolve(process.cwd(), directory_name);
    const tables_directory = path.resolve(process.cwd(), directory_name, 'tables/');

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
      })
    })
  })
}

//// call setup function
setup();
