'use strict';

var util = require('util');
var Q = require('q');
var Processor = require('../../../src/processor.js');

var TestAlwaysFailProcessor = function TestAlwaysFailProcessor(opts) {
  Processor.apply(this, [opts]);
  this.name = 'TestAlwaysFailProcessor';
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

util.inherits(TestAlwaysFailProcessor, Processor);

TestAlwaysFailProcessor.prototype.processor = function processor() {
  var deferred = Q.defer();
  deferred.reject(new Error('processor-always-fails'));
  return deferred.promise;
};

module.exports = TestAlwaysFailProcessor;
