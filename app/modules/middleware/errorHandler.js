var errors = require('../errors/'),
    HttpError = errors.httpError,
    HttpValidateError = errors.httpValidateError;


module.exports = function(params){

    params = params || {};
    params = _.extend({
        showStack : false,
        silent : false
    },params);

    var renderError = function (res, err) {
        if (err instanceof HttpError) {
            if (err.statusCode >= 400) {
                res.json(err.statusCode, {
                    statusCode: err.statusCode,
                    message: err.message,
                    prettyMessage : err.prettyMessage,
                    code : err.code
                });
            } else {
                // not an error
                res.json(err.statusCode);
            }
        } else if (err instanceof HttpValidateError){
            if (err.statusCode >= 400) {
                res.json(err.statusCode, {
                    statusCode: err.statusCode,
                    message: err.message,
                    prettyMessage : err.message,
                    failedValidations : err.failedValidations,
                    invalidPaths : err.invalidPaths
                });
            } else {
                // not an error
                res.json(err.statusCode);
            }

        } else {
            res.json(500, {
                statusCode: 500,
                name: err.name,
                message: err.message
            });
        }
    };

    return function (err, req, res, next) {
        if(!params.silent){
            if (err instanceof Error) {
                if (err instanceof HttpError || err instanceof HttpValidateError) {
                    if(params.showStack){
                        console.log(err.stack);
                    }else{
                        console.log(err.toString());
                    }

                } else {
                    console.log('Uncaught error', { stack: err.stack });
                }
            } else {
                err = new Error(err);
                console.error('Uncaught non-error', { error: err });
            }
        }

        renderError(res, err);
    }
};