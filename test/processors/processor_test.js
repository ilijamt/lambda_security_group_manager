/* eslint-env node, mocha */
/* eslint-disable new-cap, no-path-concat, no-unused-vars */
var should = require('should');

describe('Processor', function() {
  var Processor = require('../../src/processor');

  describe('constructor', function() {
    describe('with parameters', function() {
      var processor = new Processor({test: false});
      it('should have correct parameters', function() {
        processor.opts.should.be.deepEqual({test: false});
      });
    });
    describe('without parameters', function() {
      var processor = new Processor();
      it('should have empty parameters', function() {
        processor.opts.should.be.deepEqual({});
      });
    });
  });

  describe('#addIPv4', function() {
    var processor = new Processor();

    it('add new ip address => should return true', function() {
      processor.clearIpAddresses();
      processor.addIPv4('127.0.0.1').should.be.true();
      processor.addIPv4('192.168.1.1').should.be.true();
      processor.ips.ipv4.should.containEql('127.0.0.1');
    });

    it('add existing ip address => should return false', function() {
      processor.clearIpAddresses();
      processor.addIPv4('127.0.0.1').should.be.true();
      processor.addIPv4('192.168.1.1').should.be.true();
      processor.ips.ipv4.should.containEql('127.0.0.1');
      processor.addIPv4('127.0.0.1').should.be.false();
    });
  });

  describe('#addIPv6', function() {
    var processor = new Processor();

    it('add new ip address => should return true', function() {
      processor.clearIpAddresses();
      processor.addIPv6('FE80::0202:B3FF:FE1E:8329').should.be.true();
      processor.ips.ipv6.should.containEql('FE80::0202:B3FF:FE1E:8329');
    });

    it('add existing ip address => should return false', function() {
      processor.clearIpAddresses();
      processor.addIPv6('FE80::0202:B3FF:FE1E:8329').should.be.true();
      processor.ips.ipv6.should.containEql('FE80::0202:B3FF:FE1E:8329');
      processor.addIPv6('FE80::0202:B3FF:FE1E:8329').should.be.false();
    });
  });

  describe('#clearIpAddresses', function() {
    var processor = new Processor();

    it('add ip addresses then clear it', function() {
      processor.addIPv4('127.0.0.1').should.be.true();
      processor.addIPv4('192.168.1.1').should.be.true();
      processor.addIPv6('FE80::0202:B3FF:FE1E:8329').should.be.true();
      processor.ips.ipv4.should.containEql('127.0.0.1');
      processor.ips.ipv4.should.containEql('192.168.1.1');
      processor.ips.ipv6.should.containEql('FE80::0202:B3FF:FE1E:8329');
      processor.clearIpAddresses();
      processor.ips.ipv4.should.be.empty();
      processor.ips.ipv6.should.be.empty();
    });
  });

  describe('#get()', function() {
    var processor = new Processor();

    it('should be an instance of Processor', function() {
      processor.should.be.instanceOf(Processor);
    });

    it('should be an object', function() {
      processor.should.be.a.Object();
      should(processor).be.ok();
    });

    it('returned data should be an object', function() {
      processor.get().should.be.a.Object();
      should(processor.get()).be.ok();
    });

    it('should have error and name properties', function() {
      processor.get().should.have.property('error', null);
      processor.get().should.have.property('name', 'Processor');
    });

    it('should have ips properties with empty ipv4 and ipv6', function() {
      processor.get().should.have.property('ips');
      processor.get().ips.should.have.property('ipv6').with.lengthOf(0);
      processor.get().ips.should.have.property('ipv4').with.lengthOf(0);
    });

    it('should have correct data', function() {
      processor.get().should.containEql({
        error: null,
        name: 'Processor',
        ips: {
          ipv4: [],
          ipv6: []
        }
      });
    });
  });

  describe('#reset()', function() {
    var processor = new Processor();

    before(function() {
      processor.error = new Error();
      processor.ips = null;
    });

    beforeEach(function() {
      processor.reset();
    });

    it('should be an object', function() {
      processor.get().should.be.a.Object();
      should(processor.get()).be.ok();
    });

    it('all the data should be reset to default values', function() {
      processor.get().should.have.property('ips');
      processor.get().ips.should.have.property('ipv6').with.lengthOf(0);
      processor.get().ips.should.have.property('ipv4').with.lengthOf(0);
    });
  });

  describe('#init()', function() {
    var processor = new Processor();

    it('should be a Promise', function() {
      return processor.init().should.be.a.Promise();
    });

    it('should have correct data', function() {
      return processor.init().should.be.fulfilledWith({
        error: null,
        name: 'Processor',
        ips: {
          ipv4: [],
          ipv6: []
        }
      });
    });
  });
});
