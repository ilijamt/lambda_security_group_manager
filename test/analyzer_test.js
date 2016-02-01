/* eslint-env node, mocha */
/* eslint-disable new-cap, no-path-concat, no-unused-vars */
'use strict';

describe('Analyzer', function() {
  var Analyzer = require('../src/analyzer');
  var dummyIpList = {
    amazon: ['127.0.0.1', '2001:0002:6c::430', '192.168.1.1', '127.1.1.1', '::1'],
    processor: ['192.168.1.1', '127.0.0.1', '2001:0002:6c::430', '2001:0002:6c::431']
  };
  var dummyIpListAnalyzed = {
    add: ['2001:0002:6c::431'],
    remove: ['127.1.1.1', '::1']
  };
  var invalidIpList = {};

  describe('with valid ip list', function() {
    it('with default config, returns a correct ip list', function() {
      var object = Analyzer.analyze(dummyIpList);
      object.should.have.property('add').with.lengthOf(dummyIpListAnalyzed.add.length);
      object.should.have.property('remove').with.lengthOf(dummyIpListAnalyzed.remove.length);
      object.add.should.containDeep(dummyIpListAnalyzed.add);
      object.remove.should.containDeep(dummyIpListAnalyzed.remove);
    });

    it('with alwaysRemove, returns a correct ip list', function() {
      var object = Analyzer.analyze(dummyIpList, {
        alwaysRemove: true
      });
      object.should.have.property('add').with.lengthOf(dummyIpList.processor.length);
      object.should.have.property('remove').with.lengthOf(dummyIpList.amazon.length);
    });
  });

  describe('with invalid ip list', function() {
    it('with default config, will return empty ip list', function() {
      var object = Analyzer.analyze(invalidIpList);
      object.should.have.property('add').with.lengthOf(0);
      object.should.have.property('remove').with.lengthOf(0);
    });

    it('with alwaysRemove, will return empty ip list', function() {
      var object = Analyzer.analyze(invalidIpList, {
        alwaysRemove: true
      });
      object.should.have.property('add').with.lengthOf(0);
      object.should.have.property('remove').with.lengthOf(0);
    });
  });
});
