/* global describe, it, expect */

var $require = require('proxyquire');
var factory = require('..');
var expect = require('chai').expect;
var sinon = require('sinon');


describe('fingro-lrdd', function() {
  
  it('should export function', function() {
    expect(factory).to.be.an('function');
  });
  
  describe('resolveAliases', function() {
    
    describe('with aliases', function() {
      var lrdd = sinon.stub().yields(null, {
        subject: 'acct:paulej@packetizer.com',
        aliases: [ 'h323:paulej@packetizer.com' ],
        properties: {
          'http://packetizer.com/ns/name#zh-CN': '保罗‧琼斯',
          'http://packetizer.com/ns/activated': '2000-02-17T03:00:00Z',
          'http://packetizer.com/ns/name': 'Paul E. Jones'
        },
        links: [
          { rel: 'http://webfinger.net/rel/avatar',
            type: 'image/jpeg',
            href: 'http://www.packetizer.com/people/paulej/images/paulej.jpg' }
        ]
      });
      
      var aliases;
      before(function(done) {
        var resolver = $require('..', { webfinger: { lrdd: lrdd } })();
        
        resolver.resolveAliases('acct:paulej@packetizer.com', function(err, s) {
          if (err) { return done(err); }
          aliases = s;
          done();
        })
      });
      
      it('should call lrdd', function() {
        expect(lrdd).to.have.been.calledOnce;
        expect(lrdd).to.have.been.calledWith(
          'acct:paulej@packetizer.com', {}
        );
      });
      
      it('should yeild aliases', function() {
        expect(aliases).to.be.an('array');
        expect(aliases).to.have.length(1);
        expect(aliases).to.deep.equal([ 'h323:paulej@packetizer.com' ]);
      });
    });
    
    describe('without aliases', function() {
      var lrdd = sinon.stub().yields(null, {
        subject: 'acct:paulej@packetizer.com',
        properties: {
          'http://packetizer.com/ns/name#zh-CN': '保罗‧琼斯',
          'http://packetizer.com/ns/activated': '2000-02-17T03:00:00Z',
          'http://packetizer.com/ns/name': 'Paul E. Jones'
        },
        links: [
          { rel: 'http://webfinger.net/rel/avatar',
            type: 'image/jpeg',
            href: 'http://www.packetizer.com/people/paulej/images/paulej.jpg' }
        ]
      });
      
      var aliases, error;
      before(function(done) {
        var resolver = $require('..', { webfinger: { lrdd: lrdd } })();
        
        resolver.resolveAliases('acct:paulej@packetizer.com', function(err, a) {
          error = err;
          aliases = a;
          done();
        })
      });
      
      it('should yield error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('No aliases in resource descriptor');
        expect(error.code).to.equal('ENODATA');
      });
      
      it('should not yeild aliases', function() {
        expect(aliases).to.be.undefined;
      });
    });
    
    describe('error due to Web Host Metadata not supported', function() {
      var lrdd = sinon.stub().yields(new Error("Unable to get host-meta or host-meta.json"));
      
      var aliases, error;
      before(function(done) {
        var resolver = $require('..', { webfinger: { lrdd: lrdd } })();
        
        resolver.resolveAliases('acct:paulej@packetizer.com', function(err, a) {
          error = err;
          aliases = a;
          done();
        })
      });
      
      it('should yield error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('Unable to get host-meta or host-meta.json');
        expect(error.code).to.equal('EPROTONOSUPPORT');
      });
      
      it('should not yeild aliases', function() {
        expect(aliases).to.be.undefined;
      });
    });
    
  });
  
  describe('resolveServices', function() {
    
    describe('without type, from packetizer.com', function() {
      var lrdd = sinon.stub().yields(null, {
        subject: 'acct:paulej@packetizer.com',
        aliases: [ 'h323:paulej@packetizer.com' ],
        properties: {
          'http://packetizer.com/ns/name#zh-CN': '保罗‧琼斯',
          'http://packetizer.com/ns/activated': '2000-02-17T03:00:00Z',
          'http://packetizer.com/ns/name': 'Paul E. Jones'
        },
        links: [
          { rel: 'http://webfinger.net/rel/avatar',
            type: 'image/jpeg',
            href: 'http://www.packetizer.com/people/paulej/images/paulej.jpg' },
          { rel: 'http://specs.openid.net/auth/2.0/provider',
            href: 'https://openid.packetizer.com/paulej' },
          { rel: 'http://packetizer.com/rel/share',
            type: 'text/html',
            href: 'http://hive.packetizer.com/users/paulej/' },
          { rel: 'http://webfinger.net/rel/profile-page',
            type: 'text/html',
            href: 'http://www.packetizer.com/people/paulej/' },
          { rel: 'http://packetizer.com/rel/blog',
            type: 'text/html',
            href: 'http://www.packetizer.com/people/paulej/blog/',
            titles: {
              default: "Paul E. Jones' Blog"
            } },
          { rel: 'http://packetizer.com/rel/businesscard',
            type: 'text/vcard',
            href: 'http://www.packetizer.com/people/paulej/paulej.vcf' },
          { rel: 'http://schemas.google.com/g/2010#updates-from',
            type: 'application/atom+xml',
            href: 'http://www.packetizer.com/people/paulej/blog/blog.xml' },
          { rel: 'http://microformats.org/profile/hcard',
            type: 'text/html',
            href: 'http://www.packetizer.com/people/paulej/' },
          { rel: 'http://bitcoin.org/rel/address',
            href: 'bitcoin:17XoqvUCrf12H7Vc7c7uDxib8FDMXFx2p6' },
          { rel: 'http://bitcoin.org/rel/payments',
            type: 'text/plain',
            href: 'https://secure.packetizer.com/bitcoin_address/?account=paulej' }
        ]
      });
      
      var services;
      before(function(done) {
        var resolver = $require('..', { webfinger: { lrdd: lrdd } })();
        
        resolver.resolveServices('acct:paulej@packetizer.com', function(err, s) {
          if (err) { return done(err); }
          services = s;
          done();
        })
      });
      
      it('should call lrdd', function() {
        expect(lrdd).to.have.been.calledOnce;
        expect(lrdd).to.have.been.calledWith(
          'acct:paulej@packetizer.com', {}
        );
      });
      
      it('should yeild services', function() {
        expect(services).to.be.an('object');
        expect(Object.keys(services)).to.have.length(10);
        expect(services['http://webfinger.net/rel/avatar']).to.deep.equal([
          { location: 'http://www.packetizer.com/people/paulej/images/paulej.jpg', mediaType: 'image/jpeg' }
        ]);
      });
    });
    
    describe('with type, from packetizer.com', function() {
      var lrdd = sinon.stub().yields(null, {
        subject: 'acct:paulej@packetizer.com',
        aliases: [ 'h323:paulej@packetizer.com' ],
        properties: {
          'http://packetizer.com/ns/name#zh-CN': '保罗‧琼斯',
          'http://packetizer.com/ns/activated': '2000-02-17T03:00:00Z',
          'http://packetizer.com/ns/name': 'Paul E. Jones'
        },
        links: [
          { rel: 'http://webfinger.net/rel/avatar',
            type: 'image/jpeg',
            href: 'http://www.packetizer.com/people/paulej/images/paulej.jpg' },
          { rel: 'http://specs.openid.net/auth/2.0/provider',
            href: 'https://openid.packetizer.com/paulej' },
          { rel: 'http://packetizer.com/rel/share',
            type: 'text/html',
            href: 'http://hive.packetizer.com/users/paulej/' },
          { rel: 'http://webfinger.net/rel/profile-page',
            type: 'text/html',
            href: 'http://www.packetizer.com/people/paulej/' },
          { rel: 'http://packetizer.com/rel/blog',
            type: 'text/html',
            href: 'http://www.packetizer.com/people/paulej/blog/',
            titles: {
              default: "Paul E. Jones' Blog"
            } },
          { rel: 'http://packetizer.com/rel/businesscard',
            type: 'text/vcard',
            href: 'http://www.packetizer.com/people/paulej/paulej.vcf' },
          { rel: 'http://schemas.google.com/g/2010#updates-from',
            type: 'application/atom+xml',
            href: 'http://www.packetizer.com/people/paulej/blog/blog.xml' },
          { rel: 'http://microformats.org/profile/hcard',
            type: 'text/html',
            href: 'http://www.packetizer.com/people/paulej/' },
          { rel: 'http://bitcoin.org/rel/address',
            href: 'bitcoin:17XoqvUCrf12H7Vc7c7uDxib8FDMXFx2p6' },
          { rel: 'http://bitcoin.org/rel/payments',
            type: 'text/plain',
            href: 'https://secure.packetizer.com/bitcoin_address/?account=paulej' }
        ]
      });
      
      var services;
      before(function(done) {
        var resolver = $require('..', { webfinger: { lrdd: lrdd } })();
        
        resolver.resolveServices('acct:paulej@packetizer.com', 'http://specs.openid.net/auth/2.0/provider', function(err, s) {
          if (err) { return done(err); }
          services = s;
          done();
        })
      });
      
      it('should call lrdd', function() {
        expect(lrdd).to.have.been.calledOnce;
        expect(lrdd).to.have.been.calledWith(
          'acct:paulej@packetizer.com', {}
        );
      });
      
      it('should yeild services', function() {
        expect(services).to.be.an('array');
        expect(services).to.have.length(1);
        expect(services[0]).to.deep.equal(
          { location: 'https://openid.packetizer.com/paulej', mediaType: undefined }
        );
      });
    });
    
    describe('without type, from jaredhanson.net', function() {
      var lrdd = sinon.stub().yields(null, {
        subject: 'acct:me@jaredhanson.net',
        aliases: [ 'http://jaredhanson.net/', 'http://www.jaredhanson.net/' ],
        links: 
         [ { rel: 'describedby',
             href: 'http://www.jaredhanson.net/',
             type: 'text/html' },
           { rel: 'http://webfinger.net/rel/profile-page',
             href: 'http://www.jaredhanson.net/',
             type: 'text/html' },
           { rel: 'http://microformats.org/profile/hcard',
             href: 'http://www.jaredhanson.net/',
             type: 'text/html' },
           { rel: 'http://gmpg.org/xfn/11',
             href: 'http://www.jaredhanson.net/',
             type: 'text/html' },
           { rel: 'http://portablecontacts.net/spec/1.0#me',
             href: 'http://www.jaredhanson.net/index.poco.json',
             type: 'application/poco+json' },
           { rel: 'http://schemas.google.com/g/2010#updates-from',
             href: 'http://buzz.googleapis.com/feeds/106707265818431720554/public/posted',
             type: 'application/atom+xml' },
           { rel: 'http://specs.openid.net/auth/2.0/server',
             href: 'https://www.google.com/accounts/o8/ud' },
           { rel: 'http://specs.openid.net/auth/2.0/signon',
             href: 'https://www.google.com/accounts/o8/ud' },
           { rel: 'http://portablecontacts.net/spec/1.0',
             href: 'http://www-opensocial.googleusercontent.com/api/people/' },
           { rel: 'http://oexchange.org/spec/0.8/rel/user-target',
             href: 'http://www.instapaper.com/oexchange.xrd',
             type: 'application/xrd+xml' },
           { rel: 'alternate',
             href: 'http://www.jaredhanson.net/index.vcard.xml',
             type: 'application/x-vcard+xml' },
           { rel: 'alternate',
             href: 'http://www.jaredhanson.net/index.poco.json',
             type: 'application/poco+json' },
           { rel: 'alternate',
             href: 'http://www.jaredhanson.net/index.poco.xml',
             type: 'application/poco+xml' },
           { rel: 'alternate',
             href: 'http://www.jaredhanson.net/index.finger',
             type: 'text/x-finger' },
           { rel: 'meta',
             href: 'http://www.jaredhanson.net/index.rdf',
             type: 'application/rdf+xml' } ]
      });
      
      var services;
      before(function(done) {
        var resolver = $require('..', { webfinger: { lrdd: lrdd } })();
        
        resolver.resolveServices('acct:me@jaredhanson.net', function(err, s) {
          if (err) { return done(err); }
          services = s;
          done();
        })
      });
      
      it('should call lrdd', function() {
        expect(lrdd).to.have.been.calledOnce;
        expect(lrdd).to.have.been.calledWith(
          'acct:me@jaredhanson.net', {}
        );
      });
      
      it('should yeild services', function() {
        expect(services).to.be.an('object');
        expect(Object.keys(services)).to.have.length(12);
        expect(services['http://webfinger.net/rel/profile-page']).to.deep.equal([
          { location: 'http://www.jaredhanson.net/', mediaType: 'text/html' }
        ]);
        expect(services['alternate']).to.deep.equal([
          { location: 'http://www.jaredhanson.net/index.vcard.xml', mediaType: 'application/x-vcard+xml' },
          { location: 'http://www.jaredhanson.net/index.poco.json', mediaType: 'application/poco+json' },
          { location: 'http://www.jaredhanson.net/index.poco.xml', mediaType: 'application/poco+xml' },
          { location: 'http://www.jaredhanson.net/index.finger', mediaType: 'text/x-finger' }
        ]);
      });
    });
    
    describe('with type, from jaredhanson.net', function() {
      var lrdd = sinon.stub().yields(null, {
        subject: 'acct:me@jaredhanson.net',
        aliases: [ 'http://jaredhanson.net/', 'http://www.jaredhanson.net/' ],
        links: 
         [ { rel: 'describedby',
             href: 'http://www.jaredhanson.net/',
             type: 'text/html' },
           { rel: 'http://webfinger.net/rel/profile-page',
             href: 'http://www.jaredhanson.net/',
             type: 'text/html' },
           { rel: 'http://microformats.org/profile/hcard',
             href: 'http://www.jaredhanson.net/',
             type: 'text/html' },
           { rel: 'http://gmpg.org/xfn/11',
             href: 'http://www.jaredhanson.net/',
             type: 'text/html' },
           { rel: 'http://portablecontacts.net/spec/1.0#me',
             href: 'http://www.jaredhanson.net/index.poco.json',
             type: 'application/poco+json' },
           { rel: 'http://schemas.google.com/g/2010#updates-from',
             href: 'http://buzz.googleapis.com/feeds/106707265818431720554/public/posted',
             type: 'application/atom+xml' },
           { rel: 'http://specs.openid.net/auth/2.0/server',
             href: 'https://www.google.com/accounts/o8/ud' },
           { rel: 'http://specs.openid.net/auth/2.0/signon',
             href: 'https://www.google.com/accounts/o8/ud' },
           { rel: 'http://portablecontacts.net/spec/1.0',
             href: 'http://www-opensocial.googleusercontent.com/api/people/' },
           { rel: 'http://oexchange.org/spec/0.8/rel/user-target',
             href: 'http://www.instapaper.com/oexchange.xrd',
             type: 'application/xrd+xml' },
           { rel: 'alternate',
             href: 'http://www.jaredhanson.net/index.vcard.xml',
             type: 'application/x-vcard+xml' },
           { rel: 'alternate',
             href: 'http://www.jaredhanson.net/index.poco.json',
             type: 'application/poco+json' },
           { rel: 'alternate',
             href: 'http://www.jaredhanson.net/index.poco.xml',
             type: 'application/poco+xml' },
           { rel: 'alternate',
             href: 'http://www.jaredhanson.net/index.finger',
             type: 'text/x-finger' },
           { rel: 'meta',
             href: 'http://www.jaredhanson.net/index.rdf',
             type: 'application/rdf+xml' } ]
      });
      
      var services;
      before(function(done) {
        var resolver = $require('..', { webfinger: { lrdd: lrdd } })();
        
        resolver.resolveServices('acct:me@jaredhanson.net', 'alternate', function(err, s) {
          if (err) { return done(err); }
          services = s;
          done();
        })
      });
      
      it('should call lrdd', function() {
        expect(lrdd).to.have.been.calledOnce;
        expect(lrdd).to.have.been.calledWith(
          'acct:me@jaredhanson.net', {}
        );
      });
      
      it('should yeild services', function() {
        expect(services).to.be.an('array');
        expect(Object.keys(services)).to.have.length(4);
        expect(services).to.deep.equal([
          { location: 'http://www.jaredhanson.net/index.vcard.xml', mediaType: 'application/x-vcard+xml' },
          { location: 'http://www.jaredhanson.net/index.poco.json', mediaType: 'application/poco+json' },
          { location: 'http://www.jaredhanson.net/index.poco.xml', mediaType: 'application/poco+xml' },
          { location: 'http://www.jaredhanson.net/index.finger', mediaType: 'text/x-finger' }
        ]);
      });
    });
    
    describe('with unsupported type', function() {
      var lrdd = sinon.stub().yields(null, {
        subject: 'acct:paulej@packetizer.com',
        aliases: [ 'h323:paulej@packetizer.com' ],
        properties: {
          'http://packetizer.com/ns/name#zh-CN': '保罗‧琼斯',
          'http://packetizer.com/ns/activated': '2000-02-17T03:00:00Z',
          'http://packetizer.com/ns/name': 'Paul E. Jones'
        },
        links: [
          { rel: 'http://webfinger.net/rel/avatar',
            type: 'image/jpeg',
            href: 'http://www.packetizer.com/people/paulej/images/paulej.jpg' }
        ]
      });
      
      var services, error;
      before(function(done) {
        var resolver = $require('..', { webfinger: { lrdd: lrdd } })();
        
        resolver.resolveServices('acct:paulej@packetizer.com', 'foo', function(err, s) {
          error = err;
          services = s;
          done();
        })
      });
      
      it('should yield error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('Link relation not found: foo');
        expect(error.code).to.equal('ENODATA');
      });
      
      it('should not yeild services', function() {
        expect(services).to.be.undefined;
      });
    });
    
    describe('without links', function() {
      var lrdd = sinon.stub().yields(null, {
        subject: 'acct:paulej@packetizer.com',
        aliases: [ 'h323:paulej@packetizer.com' ],
        properties: {
          'http://packetizer.com/ns/name#zh-CN': '保罗‧琼斯',
          'http://packetizer.com/ns/activated': '2000-02-17T03:00:00Z',
          'http://packetizer.com/ns/name': 'Paul E. Jones'
        }
      });
      
      var services, error;
      before(function(done) {
        var resolver = $require('..', { webfinger: { lrdd: lrdd } })();
        
        resolver.resolveServices('acct:paulej@packetizer.com', function(err, s) {
          error = err;
          services = s;
          done();
        })
      });
      
      it('should yield error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('No link relations in resource descriptor');
        expect(error.code).to.equal('ENODATA');
      });
      
      it('should not yeild services', function() {
        expect(services).to.be.undefined;
      });
    });
    
    describe('error due to Web Host Metadata not supported', function() {
      var lrdd = sinon.stub().yields(new Error("Unable to get host-meta or host-meta.json"));
      
      var error, services;
      before(function(done) {
        var resolver = $require('..', { webfinger: { lrdd: lrdd } })();
        
        resolver.resolveServices('acct:paulej@packetizer.com', function(err, s) {
          error = err;
          services = s;
          done();
        })
      });
      
      it('should yield error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('Unable to get host-meta or host-meta.json');
        expect(error.code).to.equal('EPROTONOSUPPORT');
      });
      
      it('should not yeild services', function() {
        expect(services).to.be.undefined;
      });
    });
    
    describe('error due to domain not found', function() {
      var ierr = new Error('getaddrinfo ENOTFOUND afasdf8asdfsadfiasdf.com');
      ierr.code = 'ENOTFOUND';
      ierr.errno = 'ENOTFOUND';
      ierr.syscall = 'getaddrinfo';
      ierr.hostname = 'afasdf8asdfsadfiasdf.com';
      var lrdd = sinon.stub().yields(ierr);
      
      var error, services;
      before(function(done) {
        var resolver = $require('..', { webfinger: { lrdd: lrdd } })();
        
        resolver.resolveServices('acct:paulej@packetizer.com', function(err, s) {
          error = err;
          services = s;
          done();
        })
      });
      
      it('should yield error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('getaddrinfo ENOTFOUND afasdf8asdfsadfiasdf.com');
        expect(error.code).to.equal('ENOTFOUND');
      });
      
      it('should not yeild services', function() {
        expect(services).to.be.undefined;
      });
    });
    
  });
  
});
