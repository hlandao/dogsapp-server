var express = require('express');

module.exports = function(){
    if(this.set('enableCsrf')){
        var csrfValue = function(req) {
            var token = (req.body && req.body._csrf)
                || (req.query && req.query._csrf)
                || (req.headers['x-csrf-token'])
                || (req.headers['x-xsrf-token']);
            console.log('csrfToken', token);
            return token;
        };

        this.use(express.csrf( {value: csrfValue} ));

        this.use(function(req, res, next) {
            res.cookie('XSRF-TOKEN', req.csrfToken());
            //res.cookie('XSRF-TOKEN', req.session._csrf);
            next();
        });

    }
};