_ = require('underscore');

module.exports = function() {


  this.set('views', __dirname + '/../../app/views');
  this.set('view engine', 'jade');
  this.format('html', { extension: '.jade' });

  this.set( 'enableLogger', true);
  this.set('sessionStoreType', 'redis');
  this.set('enableCsrf', false);

  this.logger = require('../../app/modules/other/logger');

  this.datastore(require('locomotive-mongoose'));
};