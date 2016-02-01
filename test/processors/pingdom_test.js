/* eslint-env node, mocha */
/* eslint-disable new-cap, no-path-concat, no-unused-vars */
var nock = require('nock');
var should = require('should');

describe('PingdomProcessor', function() {
  var Processor = require('../../src/processor');
  var PingdomProcessor = require('../../src/processors/pingdom');

  describe('property', function() {
    var URI = 'https://my.pingdom.com/probes/feed';
    var processor = new PingdomProcessor({URI: URI});

    it('has URI', function() {
      processor.should.have.property('URI', URI);
    });
  });

  describe('instanceOf', function() {
    var processor = new PingdomProcessor();

    it('Processor', function() {
      processor.should.be.instanceOf(Processor);
    });

    it('PingdomProcessor', function() {
      processor.should.be.instanceOf(PingdomProcessor);
    });
  });

  describe('#process() resolve', function() {
    it('should be fulfilled', function(done) {
      var object = new PingdomProcessor();
      var api = nock('https://my.pingdom.com').get('/probes/feed').replyWithFile(200, __dirname + '/../data/pingdom-xml/probe_servers.xml');
      var promise = object.init();

      api.isDone().should.be.false();
      promise.should.be.a.Promise();

      promise.then(function(data) {
        api.isDone().should.be.true();
        should.not.exists(data.error);
        should.exists(data.ips);
        data.should.have.property('name', 'PingdomProcessor');
        data.ips.should.have.property('ipv6').with.lengthOf(3);
        data.ips.should.have.property('ipv4').with.lengthOf(3);
        data.ips.ipv4.should.containEql('95.211.228.65');
        data.ips.ipv4.should.containEql('168.1.92.58');
        data.ips.ipv4.should.containEql('168.3.92.58');
        data.ips.ipv6.should.containEql('2001:1AF8:4020:A04B:0001::498');
        data.ips.ipv6.should.containEql('2401:c900:1301:78::5');
        data.ips.ipv6.should.containEql('2401:c901:1301:78::5');
        done();
      }).fail(function(err) {
        done(err);
      });
    });
  });

  describe('#process() fail', function() {
    it('should be rejected and fails with an error', function(done) {
      var object = new PingdomProcessor();
      var api = nock('https://my.pingdom.com').get('/probes/feed').reply(400);
      var promise = object.init();

      api.isDone().should.be.false();
      promise.should.be.a.Promise();
      promise.should.be.rejected();

      promise.then(function(data) {
        console.log('data', data);
        done();
      }).fail(function(err) {
        err.should.be.Error();
        done();
      });
    });

    it('should be rejected and fails because of no items in the xml', function(done) {
      var object = new PingdomProcessor();
      var api = nock('https://my.pingdom.com').get('/probes/feed').replyWithFile(200, __dirname + '/../data/pingdom-xml/probe_servers_bad.xml');
      var promise = object.init();

      api.isDone().should.be.false();
      promise.should.be.a.Promise();
      promise.should.be.rejected();

      promise.then(function(data) {
        done();
      }).fail(function(err) {
        err.should.be.Error();
        done();
      });
    });

    it('should be rejected and fails because of bad xml', function(done) {
      var object = new PingdomProcessor();
      var api = nock('https://my.pingdom.com').get('/probes/feed').replyWithFile(200, __dirname + '/../data/pingdom-xml/probe_servers_invalid.xml');
      var promise = object.init();

      api.isDone().should.be.false();
      promise.should.be.a.Promise();
      promise.should.be.rejected();

      promise.then(function(data) {
        done();
      }).fail(function(err) {
        err.should.be.Error();
        done();
      });
    });
  });
});
