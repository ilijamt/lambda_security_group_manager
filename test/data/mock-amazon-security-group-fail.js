/* eslint-disable require-jsdoc, new-cap, no-path-concat, no-unused-vars, no-inline-comments */
'use strict';
var Q = require('q');
function AmazonSecurityGroup() {}

AmazonSecurityGroup.prototype.run = function() {
  var deferred = Q.defer();
  deferred.reject(new Error('asg-always-fail'));
  return deferred.promise;
};

module.exports = AmazonSecurityGroup;
