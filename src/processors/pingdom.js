'use strict';

var util = require('util');
var Q = require('q');
var xml2js = require('xml2js');
var Processor = require('../processor.js');
var parseString = xml2js.parseString;

/**
 * Pindgom IP addresses processor
 *
 * @class
 * @since 1.0.0
 *
 * @author Ilija Matoski <ilijamt@gmail.com>
 *
 * @augments Processor
 *
 * @param {?object} opts Processor parameters, see {@link Processor} for other parameters you can pass
 * @param {string} [opts.URI=https://my.pingdom.com/probes/feed] Pingdom URI
 *
 * @constructor
 */
var PingdomProcessor = function PingdomProcessor(opts) {
  Processor.apply(this, [opts]);

  /**
   * Is the function remote, used for preloading all the data before loading
   *
   * @defaultValue true
   * @type {boolean}
   */
  this.isRemote = true;

  /**
   * The name of the Processor
   *
   * @type {string}
   */
  this.name = 'PingdomProcessor';

  /**
   * URI where we can fetch all the IP addresses
   *
   * @defaultvalue https://my.pingdom.com/probes/feed
   * @type {string}
   */
  this.URI = this.opts.URI || 'https://my.pingdom.com/probes/feed';
};

util.inherits(PingdomProcessor, Processor);

/**
 * Gathers all the IP addresses from Pingdom and creates a valid list for the processor
 *
 * @return {promise} A promise
 */
PingdomProcessor.prototype.processor = function fetch() {
  var deferred = Q.defer();
  var self = this;

  require('request')(this.URI, function(error, response, body) {
    if (error || response.statusCode !== 200) {
      return deferred.reject(error || new Error('Unknown error'));
    }

    parseString(body, function(err, result) {
      if (err) {
        return deferred.reject(err);
      }

      try {
        result.rss.channel[0].item.forEach(function(probe) {
          if (probe['pingdom:ip']) {
            probe['pingdom:ip'].forEach(function(ip) {
              self.addIPv4(ip);
            });
          }

          if (probe['pingdom:ipv6']) {
            probe['pingdom:ipv6'].forEach(function(ip) {
              self.addIPv6(ip);
            });
          }
        });
      } catch (terr) {
        return deferred.reject(terr);
      }

      return deferred.resolve();
    });
  });

  return deferred.promise;
};

module.exports = PingdomProcessor;
