/* eslint-env node, mocha */
/* eslint-disable new-cap, no-path-concat, no-unused-vars */
'use strict';
var fs = require('fs');
var config = require('../config');

describe('Amazon Security Group', function() {
  var AmazonSecurityGroup = require('../src/amazon_security_group');
  var runner = require('../src/runner');
  var definition = require('./data/definitions/test-enabled.json');
  var ips = {
    ipv4: [
      '127.0.0.1'
    ],
    ipv6: [
      '::1'
    ]
  };
  var ec2stub = {
    describeSecurityGroups: function(params, callback) {
      callback(null, require('./data/ec2/describeSecurityGroups.json'));
    },
    revokeSecurityGroupIngress: function(params, callback) {
      callback(null, require('./data/ec2/revokeSecurityGroupIngress.json'));
    },
    revokeSecurityGroupEgress: function(params, callback) {
      callback(null, require('./data/ec2/revokeSecurityGroupEgress.json'));
    },
    authorizeSecurityGroupIngress: function(params, callback) {
      callback(null, require('./data/ec2/authorizeSecurityGroupIngress.json'));
    },
    authorizeSecurityGroupEgress: function(params, callback) {
      callback(null, require('./data/ec2/authorizeSecurityGroupEgress.json'));
    }
  };

  var opts = runner.buildAmazonSecurityGroupOptions(definition, {ips: ips});

  describe('Parameters', function() {
    it('default parameters', function() {
      var asg = new AmazonSecurityGroup({
        securityGroup: {id: 'id', name: 'name'},
        firewall: {
          port: {
            from: 1000,
            to: 1000
          },
          protocol: 'tcp',
          ipType: ['ipv4']
        }
      });
      asg.egress.should.be.false();
      asg.terminateAfterRemove.should.be.false();
      asg.region.should.be.equal(config.amazon.defaultRegion);
      asg.apiVersion.should.be.equal(config.amazon.defaultVersion);
      asg.ipType.should.be.containDeep(['ipv4']);
      asg.securityGroup.should.be.eql({
        id: 'id',
        name: 'name'
      });
      asg.firewall.should.be.eql({
        port: {
          from: 1000,
          to: 1000
        },
        protocol: 'tcp',
        ipType: ['ipv4']
      });
    });

    it('with some parameters passed', function() {
      var asg = new AmazonSecurityGroup({
        egress: true,
        terminateAfterRemove: true,
        region: 'eu-west-1',
        apiVersion: '2013-08-01',
        securityGroup: {id: 'id', name: 'name'},
        firewall: {
          port: {
            from: 1000,
            to: 1000
          },
          protocol: 'tcp',
          ipType: ['ipv4']
        }
      });
      asg.egress.should.be.true();
      asg.terminateAfterRemove.should.be.true();
      asg.region.should.be.equal('eu-west-1');
      asg.apiVersion.should.be.equal('2013-08-01');
      asg.ipType.should.be.containDeep(['ipv4']);
      asg.securityGroup.should.be.eql({
        id: 'id',
        name: 'name'
      });
      asg.firewall.should.be.eql({
        port: {
          from: 1000,
          to: 1000
        },
        protocol: 'tcp',
        ipType: ['ipv4']
      });
    });

    it('invalid parameters - ipType: [ipv4, ipv1, ipv6] - throws Error(invalid_ip_types)', function() {
      (function() {
        var asg = new AmazonSecurityGroup({
          firewall: {ipType: ['ipv4', 'ipv1', 'ipv6']}
        });
      }).should.throw(/invalid_ip_types/);
    });

    it('invalid parameters - ipType: [ipv3, ipv1, ipv8] - throws Error(invalid_ip_types)', function() {
      (function() {
        var asg = new AmazonSecurityGroup({
          firewall: {ipType: ['ipv3', 'ipv1', 'ipv8']}
        });
      }).should.throw(/invalid_ip_types/);
    });

    it('invalid parameters - ipType: [] - throws Error(invalid_ip_types)', function() {
      (function() {
        var asg = new AmazonSecurityGroup({
          firewall: {ipType: []}
        });
      }).should.throw(/invalid_ip_types/);
    });

    it('invalid parameters - invalid securityGroup - throws Error(invalid_security_group)', function() {
      (function() {
        var asg = new AmazonSecurityGroup({});
      }).should.throw(/invalid_security_group/);
    });

    it('invalid parameters - invalid firewall - throws Error(invalid_firewall_data)', function() {
      (function() {
        var asg = new AmazonSecurityGroup();
      }).should.throw(/invalid_firewall_data/);
      (function() {
        var asg = new AmazonSecurityGroup({
          firewall: {
            port: {
              from: 100,
              to: 900
            },
            protocol: undefined,
            ipType: null
          }
        });
      }).should.throw(/invalid_firewall_data/);
    });
  });

  describe('#describe', function() {
    var asg = new AmazonSecurityGroup(opts);
    asg.ec2 = ec2stub;
    var promise = asg.describe();

    it('promise + fulfilled', function() {
      promise.should.be.a.Promise();
      return promise.should.be.fulfilled();
    });
  });

  describe('#add', function() {
    var asg = new AmazonSecurityGroup(opts);
    asg.ec2 = ec2stub;
    var promise = asg.add();

    it('promise + fulfilled', function() {
      promise.should.be.a.Promise();
      return promise.should.be.fulfilled();
    });
  });

  describe('#remove', function() {
    var asg = new AmazonSecurityGroup(opts);
    asg.ec2 = ec2stub;
    var promise = asg.remove();

    it('promise + fulfilled', function() {
      promise.should.be.a.Promise();
      return promise.should.be.fulfilled();
    });
  });

  describe('#run', function() {
    var asg = new AmazonSecurityGroup(opts);
    asg.ec2 = ec2stub;
    var promise = asg.run();

    it('promise + fulfilled', function() {
      promise.should.be.a.Promise();
      return promise.should.be.fulfilled();
    });
  });
});
