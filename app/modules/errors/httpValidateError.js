var locomotive = require('locomotive'),
    util = require('util'),
    HttpError = require('./httpError');

function HttpValidateError(params) {
    Error.captureStackTrace(this, HttpError);
    var err, validationError, paths = [];
    params = params || {};

    if (_.isObject(params) && params.errors) {
        var errors = params.errors;

        err = {};
        err.statusCode = 500;
        err.message = "Validation Error. Wrong Params";
        err.failedValidations = [];

        for (var i in errors) {
            validationError = errors[i];
            paths.push(i);
            err.failedValidations.push({
                path: i,
                message: validationError.type,
                fullMessage: validationError.message,
                invalidValue: validationError.value
            });
        }

        err.invalidPaths = paths.join(' ');
    }

    if (err) {
        _.extend(this, err);
    } else {
        this.statusCode = 500;
        this.message = "Validation Error. Wrong Params";
        if(params.err) _.extend(this,params.err);
    }
}

util.inherits(HttpValidateError, Error);
HttpValidateError.prototype.name = 'HttpValidateError';
HttpValidateError.prototype.toString = function () {
    return "[" + this.name + '] ' + this.statusCode + ' ' + this.message + '(' + this.invalidPaths + ')';
};


module.exports = HttpValidateError;