#!/usr/bin/env node

// LIBRARIES

/// node/core libs

// app/local libs
import sketchdb from './src/index.js';

// APP
sketchdb
  .setup()
  .then(() => {
    console.log('sketchdb setup complete.');
  })
  .catch((err) => {
    console.error('sketchdb setup failed:', err);
    process.exit(1);
  });
