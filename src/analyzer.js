'use strict';
var _ = require('lodash');

/**
 * Analyzer, responsible for analyzing the IP addresses from {@link Processor} and from Amazon Web Services
 *
 * @constructor
 */
function Analyzer() {

}

/**
 * Analyze the IP list and based on the {@param config} return a list of ip addresses to process
 *
 * @param {object} ips IP List object
 * @param {array} [ips.processor=[]] A list of IP addresses passed from the processor
 * @param {array} [ips.amazon=[]] A list of IP addresses passed from amazon describe
 *
 * @param {object} config Configuration, usually extracted from the definitions
 * @param {boolean} [config.alwaysRemove=false] Always remove the IP addresses from the Amazon Security group and then add them
 *
 * @return {{add: Array, remove: Array}} An analyzed list to be passed along to amazon services
 */
Analyzer.prototype.analyze = function analyze(ips, config) {
  var processorIpList = ips.processor || [];
  var amazonSecurityGroupIpList = ips.amazon || [];
  var addIpList = [];
  var removeIpList = [];

  config = config || {};
  config.alwaysRemove = config.alwaysRemove || false;

  if (config.alwaysRemove) {
    removeIpList = amazonSecurityGroupIpList;
    addIpList = processorIpList;
  } else {
    removeIpList = _.difference(amazonSecurityGroupIpList, processorIpList);
    addIpList = _.difference(processorIpList, amazonSecurityGroupIpList);
  }

  return {
    add: addIpList,
    remove: removeIpList
  };
};

module.exports = new Analyzer();
