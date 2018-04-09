var lrdd = require('webfinger').lrdd;
var ProtoNoSupportError = require('./errors/protonosupporterror');
var NoDataError = require('./errors/nodataerror');


function Resolver() {
}

Resolver.prototype.resolve = function(identifier, cb) {
  lrdd(identifier, {}, function(err, jrd) {
    if (err) { return err.code ? cb(err) : cb(new ProtoNoSupportError(err.message)); }
    var rec = {}
      , services = {}
      , links = jrd.links
      , link, i, len;
    if (jrd.subject) { rec.subject = jrd.subject; }
    if (jrd.aliases) {
      rec.aliases = jrd.aliases;
    }
    if (jrd.properties) {
      rec.attributes = jrd.properties;
    }
    if (links) {
      for (i = 0, len = links.length; i < len; ++i) {
        link = links[i];
        services[link.rel] = (services[link.rel] || []).concat({
          location: link.href,
          mediaType: link.type
        });
      }
      rec.services = services;
    }
    
    return cb(null, rec);
  });
}

Resolver.prototype.resolveAliases = function(identifier, cb) {
  this.resolve(identifier, function(err, rec) {
    if (err) { return cb(err); }
    if (!rec.aliases || rec.aliases.length == 0) {
      return cb(new NoDataError('No aliases in resource descriptor'));
    }
    
    return cb(null, rec.aliases);
  });
}

Resolver.prototype.resolveAttributes = function(identifier, cb) {
  this.resolve(identifier, function(err, rec) {
    if (err) { return cb(err); }
    if (!rec.attributes) {
      return cb(new NoDataError('No properties in resource descriptor'));
    }
    
    return cb(null, rec.attributes);
  });
}

Resolver.prototype.resolveServices = function(identifier, type, cb) {
  if (typeof type == 'function') {
    cb = type;
    type = undefined;
  }
  
  this.resolve(identifier, function(err, rec) {
    if (err) { return cb(err); }
    if (!rec.services || rec.services.length == 0) {
      return cb(new NoDataError('No link relations in resource descriptor'));
    }
    
    var services = rec.services
      , instances;
    if (type) {
      instances = services[type];
      if (!instances) { return cb(new NoDataError('Link relation not found: ' + type)); }
      return cb(null, instances);
    }
    return cb(null, rec.services);
  });
}


/**
 * Creates a LRDD resolver.
 *
 * Note that the LRDD resolution mechanisms was initially described under the
 * name WebFinger, as can be read on Eran Hammer's blog beginning in August of
 * 2009:
 *   - [Introducing WebFinger](https://hueniverse.com/introducing-webfinger-92e64a08e3f3)
 *   - [Implementing WebFinger](https://hueniverse.com/implementing-webfinger-fa94335311aa)
 *
 * References:
 *  - [Web Host Metadata](https://tools.ietf.org/html/rfc6415)
 *
 * @api public
 */
module.exports = function() {
  return new Resolver();
}
