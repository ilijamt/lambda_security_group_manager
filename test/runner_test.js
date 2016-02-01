/* eslint-env node, mocha */
/* eslint-disable new-cap, no-path-concat, no-unused-vars */
'use strict';
var should = require('should');
var path = require('path');

describe('Runner', function() {
  var config = require('../config');
  var runner = require('../src/runner');
  var originalConfig = {};

  before(function() {
    originalConfig = {
      root: config.root,
      definitions: {
        dir: config.definitions.dir
      },
      processors: {
        dir: config.processors.dir
      }
    };
    config.root = path.join(__dirname, 'data');
    config.definitions.dir = path.join(config.root, 'definitions');
    config.processors.dir = path.join(config.root, 'processors');
  });

  describe('#run', function() {
    it('should be a promise', function() {
      return runner.run().should.be.a.Promise();
    });
  });

  describe('#getFiles', function() {
    it('should return files from a valid type', function(done) {
      return runner.getFiles(runner.TYPE_PROCESSORS)
        .then(function onFulfilled(files) {
          done();
        }, function onRejected(error) {
          done(error);
        });
    });

    it('should fail from invalid type', function(done) {
      return runner.getFiles('invalid-type')
        .then(function onFulfilled(files) {
          done(new Error('Should have failed'));
        }, function onRejected(error) {
          done();
        });
    });
  });

  describe('#loadDefinitions', function() {
    it('should load definitions', function() {
      return runner.loadDefinitions().should.be.fulfilled();
    });

    it('should have exactly one definiton and correct data', function() {
      runner.definitions.should.have.length(1);
      var definition = runner.definitions[0];
      definition.name.should.be.equal('Test Enabled');
      definition.enabled.should.be.true();
      definition.processor.should.be.equal('TestProcessor');
    });
  });

  describe('#loadProcessors', function() {
    it('should load processors', function() {
      return runner.loadProcessors().should.be.fulfilled();
    });
    it('should have exactly one processor and correct data', function() {
      runner.processors.should.have.keys('TestProcessor');
      Object.keys(runner.processors).should.have.length(1);
    });
  });

  after(function() {
    config.root = originalConfig.root;
    config.definitions.dir = originalConfig.definitions.dir;
    config.processors.dir = originalConfig.processors.dir;
  });
});
