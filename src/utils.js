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

    fsp.rm(path, { recursive: true, force: true }).then(() =>
      resolve()).catch(error => {
      reject(error);
    });
  });
};

utils.path_exists = function(path) {
  return fsp.access(path)
    .then(() => true)
    .catch(() => false);
};


module.exports = utils;
