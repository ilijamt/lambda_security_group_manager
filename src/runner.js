'use strict';
var path = require('path');
var glob = require('glob');
var Q = require('q');
var async = require('async');
var config = require('../config');

/**
 * Responsible for setting up the system and running all the processors and configurations
 *
 * @class
 * @constructor
 */
function Runner() {
  /**
   * Contains all available {@link Processor} stored in processors directory
   *
   * @type {{}}
   */
  this.processors = {};

  /**
   * Contains all available configuration files waiting to be processed
   *
   * @type {Array}
   */
  this.definitions = [];

  /**
   * Are the definitions loaded
   * @type {boolean}
   */
  this.definitionsLoaded = false;

  /**
   * Are the processors loaded
   * @type {boolean}
   */
  this.processorsLoaded = false;

  /**
   * Type processor
   *
   * @constant
   * @type {string}
   */
  this.TYPE_PROCESSORS = 'processors';

  /**
   * Type definition
   *
   * @constant
   * @type {string}
   */
  this.TYPE_DEFINITIONS = 'definitions';
}

/**
 * Get available files based on the proposed type
 *
 * @param {string} type A valid type to process, can be {@link #TYPE_PROCESSORS} or {@link #TYPE_DEFINITIONS}
 * @param {?object} options glob options, see glob documentation for what can you pass
 *
 * @return {promise} A promise
 */
Runner.prototype.getFiles = function getFiles(type, options) {
  var deferred = Q.defer();

  options = options || {};

  if (type in config) {
    var pattern = config[type].dir + path.sep + config[type].ext;
    glob(pattern, options, function(error, files) {
      return deferred.resolve(files);
    });
  } else {
    deferred.reject(new Error('Invalid type'));
  }

  return deferred.promise;
};

/**
 * Load all available, enabled and valid definitions
 *
 * @return {promise} A promise
 */
Runner.prototype.loadDefinitions = function loadDefinitions() {
  var deferred = Q.defer();
  var self = this;

  this.getFiles(this.TYPE_DEFINITIONS)
    .then(function onFulfilled(files) {
      files.forEach(function(file) {
        var definition = require(file);

        var isEnabled = 'enabled' in definition && definition.enabled;
        var hasProcessor = 'processor' in definition && definition.processor;
        var isValid = isEnabled && hasProcessor;

        if (isValid) {
          self.definitions.push(definition);
        }
      });
      self.definitionsLoaded = true;
      deferred.resolve();
    }, function onRejected(error) {
      self.definitionsLoaded = false;
      deferred.reject(error);
    });

  return deferred.promise;
};

/**
 * Load all available processors
 *
 * @return {promise} A promise
 */
Runner.prototype.loadProcessors = function loadProcessors() {
  var deferred = Q.defer();
  var self = this;

  this.getFiles(this.TYPE_PROCESSORS)
    .then(function onFulfilled(files) {
      files.forEach(function(file) {
        var Processor = require(file);
        var processor = new Processor();
        self.processors[processor.name] = processor;
      });
      self.processorsLoaded = true;
      deferred.resolve();
    }, function onRejected(error) {
      self.processorsLoaded = false;
      deferred.reject(error);
    });

  return deferred.promise;
};

/**
 * Is everything loaded and ready to go ?
 *
 * @return {boolean} Is it loaded
 */
Runner.prototype.isLoaded = function isLoaded() {
  return this.processorsLoaded && this.definitionsLoaded;
};

/**
 * Reset the state of the runner
 */
Runner.prototype.reset = function reset() {
  this.processorsLoaded = false;
  this.definitionsLoaded = false;
  this.definitions = [];
  this.processors = {};
};

Runner.prototype.preload = function preload() {
  var deferred = Q.defer();
  var processorsToPreload = [];
  var self = this;

  this.definitions.forEach(function(definition) {
    var processorName = definition.processor;
    var processor = self.processors[processorName];
    /* istanbul ignore else */
    if (processor && processor.isRemote && processor.isCacheable) {
      processorsToPreload.push(processorName);
    }
  });

  async.eachLimit(processorsToPreload, config.concurrency, function(processor, callback) {
    self.processors[processor].init()
      .then(function onFulfilled(data) {
        callback(null, data);
      }, function onRejected(error) {
        callback(error);
      });
  }, function(err) {
    if (err) {
      return deferred.reject(err);
    }

    deferred.resolve();
  });

  return deferred.promise;
};

Runner.prototype.buildAmazonSecurityGroupOptions = function(definition, processor) {
  return {
    egress: definition.egress,
    terminateAfterRemove: definition.terminateAfterRemove,
    ipType: definition.ipType,
    ips: processor.ips,
    securityGroup: definition.securityGroup,
    firewall: definition.firewall,
    apiVersion: definition.apiVersion,
    region: definition.region
  };
};

/**
 * Process all the definitions
 *
 * @return {promise} A promise
 */
Runner.prototype.process = function() {
  var deferred = Q.defer();
  var self = this;

  this.preload()
    .then(function onFulfilled() {
      async.eachLimit(self.definitions, config.concurrency,
        function handler(definition, callback) {
          var processor = self.processors[definition.processor];
          processor.init()
            .then(function onFulfilled(data) {
              var AmazonSecurityGroup = require('./amazon_security_group');
              var asg = new AmazonSecurityGroup(self.buildAmazonSecurityGroupOptions(definition, data));
              asg.run()
                .then(function onFulfilled(data) {
                  callback(null, data);
                }, function onRejected(error) {
                  callback(error);
                });
            },
            /* istanbul ignore next */
            function onRejected(error) {
              callback(error);
            });
        },
        function callback(error) {
          if (error) {
            return deferred.reject(error);
          }
          return deferred.resolve();
        });
    }, function onAsyncRejected(error) {
      return deferred.reject(error);
    });

  return deferred.promise;
};

/**
 * Load all definitions and {@link Processor}
 *
 * @return {promise} A promise
 */
Runner.prototype.load = function() {
  var deferred = Q.defer();
  Q.all([this.loadDefinitions(), this.loadProcessors()])
    .spread(function onFulfilled(data) {
      return deferred.resolve(data);
    }, function onRejected(error) {
      return deferred.reject(error);
    })
    .done();
  return deferred.promise;
};

/**
 * Start the runner, it will load all {@link Processor} and configuration files, and then process the definitions
 *
 * @return {promise} A promise
 */
Runner.prototype.run = function run() {
  var deferred = Q.defer();
  this.load()
    .then(Runner.prototype.process.bind(this))
    .then(function onFulfilled(data) {
      return deferred.resolve(data);
    }, function onRejected(error) {
      return deferred.reject(error);
    });
  return deferred.promise;
};

module.exports = new Runner();
