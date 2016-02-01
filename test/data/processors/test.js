'use strict';

var util = require('util');
var Processor = require('../../../src/processor.js');

var TestProcessor = function TestProcessor(opts) {
  Processor.apply(this, [opts]);
  this.name = 'TestProcessor';
  this.ips = {
    ipv4: [
      '127.0.0.1'
    ],
    ipv6: [
      '::1'
    ]
  };
};

util.inherits(TestProcessor, Processor);

module.exports = TestProcessor;
