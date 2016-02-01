'use strict';
var path = require('path');

/**
 * Configuration object that configures how the system behaves
 *
 * @namespace
 *
 * @property {string} root The app root directory
 * @property {object} definitions The definitions directory and extension
 * @property {string} definitions.dir The definitions relative directory to the root, defaults to <b>./configs</b> <br/>
 * If you want to override from the command line you need to set <b>DIR_DEFS</b> environment variable to the path you want
 * @property {string} definitions.ext The definitions extension, defaults to <b>*.json</b><br/>
 * If you want to override from the command line you need to set <b>EXT_DEFS</b> environment variable to the extension you want
 * @property {object} processors The processors directory and extension
 * @property {string} processors.dir The processors relative directory to the root, defaults to <b>./src/processors</b> <br/>
 * If you want to override from the command line you need to set <b>DIR_PROCESSORS</b> environment variable to the path you want
 * @property {string} processors.ext The processors extension, defaults to <b>*.js</b><br/>
 * If you want to override from the command line you need to set <b>EXT_PROCESSORS</b> environment variable to the extension you want
 * @property {number} concurrency How many items should it run concurrently, defaults to: <b>5</b>
 *
 * @type {object}
 */
var config = {
  root: __dirname,
  concurrency: parseInt(process.env.CONCURRENCY, 10) || 5,
  definitions: {
    dir: path.join(__dirname, process.env.DIR_DEFS || './definitions'),
    ext: process.env.EXT_DEFS || '*.json'
  },
  processors: {
    dir: path.join(__dirname, process.env.DIR_PROCESSORS || './src/processors'),
    ext: process.env.EXT_PROCESSORS || '*.js'
  }
};

module.exports = config;
