'use strict';
var Q = require('q');
var _ = require('lodash');
var config = require('../config');
var AWS = require('aws-sdk');

/**
 * A wrapper for generating the required parameters for the update of amazon security groups
 *
 * @class
 * @since 1.0.0
 *
 * @author Ilija Matoski <ilijamt@gmail.com>
 *
 * @param {object} opts Amazon security group parameters, are combination from the definition and system settings
 * @param {string} [opts.region] Amazon region, if not supplied it defaults to {@link config}.amazon.defaultRegion
 * @param {string} [opts.apiVersion] Amazon region, if not supplied it defaults to {@link config}.amazon.defaultVersion
 * @param {boolean} [opts.egress=false] Do we need to use egress, required for EC2-VPC security groups?
 * @param {boolean} [opts.terminateAfterRemove=false] Do we terminate after we remove all the IP addresses from the Security Group?
 * @param {object} opts.securityGroup The security group we need to process, will throw an error if all parameters not defined
 * @param {string} opts.securityGroup.id The ID of the security group we need to process
 * @param {string} opts.securityGroup.name The name of the security group we need to process
 * @param {object} opts.firewall The firewall entry we will process
 * @param {object} opts.firewall.port Firewall ports
 * @param {number} opts.firewall.port.from From port
 * @param {number} opts.firewall.port.to To port
 * @param {string} opts.firewall.protocol the IP protocol name (<b>tcp</b>, <b>udp</b>, <b>icmp</b>) or a protocol number. <br/>(VPC only) Use <b>-1</b> to specify all
 * @param {array} [opts.firewall.ipType=['ipv4']] A list of ip types to use, currently the allowed types are <b>ipv4</b> or <b>ipv6</b>
 *
 * @constructor
 */
function AmazonSecurityGroup(opts) {
  /**
   * The options object for {@link AmazonSecurityGroup}, contains all settings
   *
   * @type {object}
   */
  this.opts = opts || {};

  /**
   * Amazon region to be use in the process
   *
   * @type {string}
   */
  this.region = this.opts.region || config.amazon.defaultRegion;

  /**
   * Should we use Egress, required for EC2-VPC security groups
   *
   * @default false
   * @type {boolean}
   */
  this.egress = this.opts.egress || false;

  /**
   * Should we terminate after removing all ther rules
   *
   * @default false
   * @type {boolean}
   */
  this.terminateAfterRemove = this.opts.terminateAfterRemove || false;

  /**
   * The AWS API version to use
   *
   * @default {@link config}.amazon.defaultVersion
   * @type {string}
   */
  this.apiVersion = this.opts.apiVersion || config.amazon.defaultVersion;

  /**
   * The security group we need to process
   *
   * @example
   * {
   *  id: "id",
   *  name: "name"
   * }
   *
   * @type {{id: string, name: string}}
   */
  this.securityGroup = this.opts.securityGroup || {};

  /**
   * The firewall object, we use this one to create the correct rules in the amazon security group
   *
   * @example
   * {
   *  port: {
   *    from: 9856,
   *    to: 9856
   *  },
   *  protocol: "tcp",
   *  ipType: [
   *    "ipv4"
   *  ]
   * }
   *
   * @type {{port: {from: number, to: number}, protocol: string, ipType: string[]}}
   */
  this.firewall = this.opts.firewall || {};

  /**
   * IP type
   *
   * @example [ 'ipv4', 'ipv6' ]
   *
   * @type {string[]|*|Array}
   */
  this.ipType = this.firewall.ipType || ['ipv4'];

  /**
   * A list of IP address defined by the processor
   *
   * @type {*|ips|{ipv4, ipv6}|Array|{ipv4: Array, ipv6: Array}|null}
   */
  this.ips = this.opts.ips || [];

  /**
   * The allowed IP types
   *
   * @default ['ipv4', 'ipv6']
   * @constant
   * @type {string[]}
   */
  this.ENUM_IP_TYPES = ['ipv4', 'ipv6'];

  this.validate();
}

/**
 * Wrapper for EC2
 *
 * @private
 *
 * @return {object} EC2 Instance
 */
AmazonSecurityGroup.prototype._ec2 = function EC2() {
  /* istanbul ignore if  */
  if (!this.ec2) {
    this.ec2 = new AWS.EC2({apiVersion: this.apiVersion, region: this.region});
  }
  return this.ec2;
};

/**
 * Validate the parameters
 *
 * @throws Error(invalid_ip_types)
 * @throws Error(invalid_security_group)
 */
AmazonSecurityGroup.prototype.validate = function validate() {
  // check if processors ip addresses are present
  var hasValidProcessorAddresses = this.ips && this.ips.length > 0;
  // check if firewall is valid
  var isValidFirewall = this.firewall &&
    this.firewall.port && this.firewall.port.to && this.firewall.port.from &&
    this.firewall.protocol &&
    this.firewall.ipType && this.firewall.ipType.length > 0;

  // check if security group is valid
  var isValidSecurityGroup = this.securityGroup.id && this.securityGroup.name;
  // check if the IP Type is valid
  var enumTypes = this.ENUM_IP_TYPES;
  var leftoverIpTypes = _.xor(this.ipType, this.ENUM_IP_TYPES);
  var isValidIpType = _.every(leftoverIpTypes, function(ipType) {
    return _.indexOf(enumTypes, ipType) > 0;
  });

  var errors = [];

  if (!isValidIpType) {
    errors.push('invalid_ip_types');
  }

  if (!isValidSecurityGroup) {
    errors.push('invalid_security_group');
  }

  if (!isValidFirewall) {
    errors.push('invalid_firewall_data');
  }

  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
};

/**
 * Get all the details related to the security group, this is used to calculate all the details by passing the data to {@link Analyzer}
 *
 * @return {promise} A promise
 */
AmazonSecurityGroup.prototype.describe = function describe() {
  var deferred = Q.defer();
  var method = 'describeSecurityGroups';
  var params = {
    DryRun: false,
    GroupIds: [this.securityGroup.id]
  };

  this._ec2()[method](params, function(err, result) {
    if (err) {
      return deferred.reject(err);
    }
    deferred.resolve();
  });

  return deferred.promise;
};

/**
 * Remove the necessary IP addresses from the security group
 *
 * @return {promise} A promise
 */
AmazonSecurityGroup.prototype.remove = function remove() {
  var deferred = Q.defer();
  var method = 'revokeSecurityGroupIngress';
  var params = {
    DryRun: false,
    GroupIds: [this.securityGroup.id]
  };

  if (this.egress) {
    method = 'revokeSecurityGroupEgress';
  }

  this._ec2()[method](params, function(err, result) {
    if (err) {
      return deferred.reject(err);
    }
    return deferred.resolve();
  });

  return deferred.promise;
};

/**
 * Add the necessary IP addresses to the security group
 *
 * @return {promise} A promise
 */
AmazonSecurityGroup.prototype.add = function add() {
  var deferred = Q.defer();
  var method = 'authorizeSecurityGroupIngress';
  var params = {
    DryRun: false,
    GroupIds: [this.securityGroup.id]
  };

  if (this.egress) {
    method = 'authorizeSecurityGroupEgress';
  }

  this._ec2()[method](params, function(err, result) {
    if (err) {
      return deferred.reject(err);
    }
    return deferred.resolve();
  });
  return deferred.promise;
};

/**
 * Run the command to update the secuirty group
 *
 * @return {promise} A promise
 */
AmazonSecurityGroup.prototype.run = function run() {
  var deferred = Q.defer();

  this.describe()
    .then(AmazonSecurityGroup.prototype.remove.bind(this))
    .then(AmazonSecurityGroup.prototype.add.bind(this))
    .then(function onFulfilled() {
      return deferred.resolve();
    }, function onRejected(error) {
      return deferred.reject(error);
    });

  return deferred.promise;
};

module.exports = AmazonSecurityGroup;
