// LIBRARIES

/// node/core libs
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;

/// vendor libs

/// app/local libs


// APP


const utils = {};

//// function to delete a directory and files
utils.delete_directory = function(path) {

  return new Promise(function(resolve, reject) {

    //// function to iterate through files and run fs.unlinkSync on them
    fsp.readdir(path).then(files => {

      files.forEach(function(file, index) {
        let curPath = path + "/" + file;
        fs.unlinkSync(curPath);
      });

      //// delete directory
      fsp.rmdir(path).then(() => {
        resolve();
      }).catch(error => {
        reject(error);
      });

    }).catch(error => {
      reject(error);
    });



  });

};


module.exports = utils;
