/* eslint-env node, mocha */
/* eslint-disable new-cap, no-path-concat, no-unused-vars */
describe('EmptyProcessor', function() {
  var Processor = require('../../src/processor');
  var EmptyProcessor = require('../../src/processors/empty');

  describe('instanceOf', function() {
    var processor = new EmptyProcessor();

    it('Processor', function() {
      processor.should.be.instanceOf(Processor);
    });

    it('EmptyProcessor', function() {
      processor.should.be.instanceOf(EmptyProcessor);
    });
  });

  describe('#init()', function() {
    var processor = new EmptyProcessor();

    it('should be fulfilled', function() {
      return processor.init().should.be.fulfilled();
    });

    it('should have correct data', function() {
      return processor.init().should.be.fulfilledWith({
        error: null,
        name: 'EmptyProcessor',
        ips: {
          ipv4: [],
          ipv6: []
        }
      });
    });
  });
});
