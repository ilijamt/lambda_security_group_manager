'use strict';

var Q = require('q');

/**
 * A default Processor
 *
 * @class
 * @since 1.0.0
 *
 * @author Ilija Matoski <ilijamt@gmail.com>
 *
 * @param {object} opts Processor parameters
 * @param {boolean} opts.cacheable Is the data cacheable?
 *
 * @constructor
 */
function Processor(opts) {
  /**
   * Processor options object
   *
   * @type {object}
   */
  this.opts = opts || {};

  /**
   * Is the response cacheable, if set to true it will process only once and then return the stored data
   *
   * @defaultValue true
   * @type {boolean}
   */
  this.isCacheable = this.opts.cacheable || true;

  /**
   * The name of the Processor
   *
   * @type {string}
   * @defaultValue Processor
   */
  this.name = 'Processor';

  /**
   * Object holding the IP values
   *
   * @property {array} ipv4 A collection of IPv4 addresses
   * @property {array} ipv6 A collection of IPv6 addresses
   *
   * @type {{ipv4: Array, ipv6: Array}}
   * @defaultValue { ipv4: [], ipv6: [] }
   */
  this.ips = {
    ipv4: [],
    ipv6: []
  };

  /**
   * An error returned by the processor
   *
   * @type {?error}
   * @defaultValue null
   */
  this.error = null;

  /**
   * Has it been already processed
   *
   * @type {boolean}
   * @defaultValue false
   */
  this.processed = false;
}

/**
 * Returns the processor data
 *
 * @function
 *
 * @return {{error: *, name: *, ips: *}} Processors data
 */
Processor.prototype.get = function get() {
  return {
    error: this.error,
    name: this.name,
    ips: this.ips
  };
};

/**
 * Add a new IPv4 address to {@link #ips#ipv4} if it's not already there
 *
 * @function
 *
 * @param {string} ip IPv4 Address
 * @return {boolean} true if the object is added successfully
 */
Processor.prototype.addIPv4 = function addIPv4(ip) {
  if (this.ips.ipv4.indexOf(ip) !== -1) {
    return false;
  }
  return this.ips.ipv4.push(ip) > 0;
};

/**
 * Add a new IPv6 address to {@link #ips#ipv6} if it's not already there
 *
 * @function
 * @param {string} ip IPv6 Address
 * @return {boolean} true if the object is added successfully
 */
Processor.prototype.addIPv6 = function addIPv6(ip) {
  if (this.ips.ipv6.indexOf(ip) !== -1) {
    return false;
  }
  return this.ips.ipv6.push(ip) > 0;
};

/**
 * Clear all IP addresses from the processor
 *
 * @function
 */
Processor.prototype.clearIpAddresses = function clearIpAddresses() {
  this.ips = {
    ipv4: [],
    ipv6: []
  };
};

/**
 * Reset the processor to default values, modifies {@link #error}, {@link #processed}, {@link #ips}
 *
 * @function
 */
Processor.prototype.reset = function reset() {
  this.error = null;
  this.processed = false;
  this.clearIpAddresses();
};

/**
 * The process function is a wrapper around {@link #processor} which is overriden by all processors
 *
 * @function
 *
 * @return {promise} A promise
 */
Processor.prototype.init = function process() {
  var deferred = Q.defer();
  var self = this;

  if (this.processed && this.isCacheable && !(this.error instanceof Error)) {
    deferred.resolve(this.get());
  } else {
    this.processor()
      .then(function() {
        return deferred.resolve(self.get());
      })
      .fail(function(error) {
        self.error = error;
        return deferred.reject(error);
      });
  }

  return deferred.promise;
};

/**
 * This function should be overridden by any defined processor as it is responsible for gathering and returning the data
 *
 * @function
 * @return {promise} A promise
 */
Processor.prototype.processor = function processor() {
  var deferred = Q.defer();
  this.processed = true;
  deferred.resolve();
  return deferred.promise;
};

module.exports = Processor;
