var validate = require('mongoose-validator').validate,
    async = require('async');

/**
 *
 * @param moongoseValidatorArr - an array of mongoose-validators validators
 * @returns {Function}
 */
module.exports = function (moongoseValidatorArr) {
    return function (arrVal, next) {
        async.eachSeries(arrVal,
            function async_success(item, cb) {
                async.eachSeries(moongoseValidatorArr,
                    function success(validator, cbV) {
                        validator.validator(item, cbV);
                    },
                    function error(err) {
                        if (err) return next(err);
                        return cb();
                    })


            },
            function async_error(err) {
                next(err);
            });
    }
};