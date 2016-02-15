'use strict';

var util = require('util');
var Processor = require('../../../src/processor.js');

var TestCRProcessor = function TestCRProcessor(opts) {
  Processor.apply(this, [opts]);
  this.name = 'TestCRProcessor';
  this.isRemote = true;
  this.isCacheable = true;
  this.ips = {
    ipv4: [
      '127.0.0.1'
    ],
    ipv6: [
      '::1'
    ]
  };
};

util.inherits(TestCRProcessor, Processor);

module.exports = TestCRProcessor;
