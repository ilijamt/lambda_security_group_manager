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
    before(function() {
      runner.reset();
    });
    it('should be a promise', function() {
      return runner.run().should.be.a.Promise();
    });
    it('everything should be loaded', function() {
      runner.isLoaded().should.be.true();
      runner.definitions.should.have.length(1);
      Object.keys(runner.processors).should.have.length(1);
    });
  });

  describe('#reset', function() {
    before(function() {
      runner.reset();
    });
    it('beforeRunning', function() {
      runner.isLoaded().should.be.false();
      runner.reset();
      runner.isLoaded().should.be.false();
    });
  });

  describe('#run - override to invalid type', function() {
    var originalTypeDefinitions = runner.TYPE_DEFINITIONS;
    var originalTypeProcessors = runner.TYPE_PROCESSORS;

    before(function() {
      runner.reset();
      runner.TYPE_DEFINITIONS = 'awgha34g';
      runner.TYPE_PROCESSORS = 'awgha34g';
    });

    it('should fail', function() {
      return runner.run().should.be.rejected();
    });
    it("won't be loaded", function() {
      runner.isLoaded().should.be.false();
      runner.definitions.should.have.length(0);
      Object.keys(runner.processors).should.have.length(0);
    });

    after(function() {
      runner.TYPE_DEFINITIONS = originalTypeDefinitions;
      runner.TYPE_PROCESSORS = originalTypeProcessors;
    });
  });

  describe('#getFiles', function() {
    before(function() {
      runner.reset();
    });

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
    before(function() {
      runner.reset();
    });

    it('should load definitions', function() {
      return runner.loadDefinitions().should.be.fulfilled();
    });

    it('should have exactly one definiton and correct data', function() {
      runner.definitions.should.have.length(1);
      runner.definitionsLoaded.should.be.true();
      var definition = runner.definitions[0];
      definition.name.should.be.equal('Test Enabled');
      definition.enabled.should.be.true();
      definition.processor.should.be.equal('TestProcessor');
    });
  });

  describe('#loadProcessors', function() {
    before(function() {
      runner.reset();
    });

    it('should load processors', function() {
      return runner.loadProcessors().should.be.fulfilled();
    });

    it('should have exactly one processor and correct data', function() {
      runner.processorsLoaded.should.be.true();
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
