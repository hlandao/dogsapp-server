var express = require('express');
var errorHandler = require('../../app/modules/middleware/errorHandler');

module.exports = function(){
    //compress the html responce
    this.use(express.compress());

    this.use('/public', express.static(require('path').resolve(__dirname + "/../../public")));
    this.use(this.router);
    var errorHandlerConfig = this.set('errorHandlerConfig') || {};
    this.use(errorHandler(errorHandlerConfig));

}