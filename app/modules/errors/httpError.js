var locomotive = require('locomotive'),
    util = require('util');

/**
 * List of available error codes
 */
var loginRetriesPeriodInMinutes = Math.round(locomotive.set('loginRetriesPeriod') / 1000);

var errors = {

    // general errors xxx
    401: {prettyMessage: "Not Authorized.", code: 401, statusCode: 401},
    403: {prettyMessage: "Forbidden.", code: 403, statusCode: 403},
    410: {prettyMessage: "Invalid Params.", code: 410, statusCode: 400},
    420: {prettyMessage: "Db error in fetching item. Wrong params.", code: 420, statusCode: 500},
    421: {prettyMessage: "Db error in fetching item. Db Error.", code: 421, statusCode: 500},
    422: {prettyMessage: "Db error in fetching item. Cannot find resource.", code: 422, statusCode: 500},
    450: {prettyMessage: "Error delete an item. Recivied no item.", code: 4501, statusCode: 500},
    451: {prettyMessage: "Error delete an item. Db Error.", code: 451, statusCode: 500},


    // errors related to users_controller 1xxx
    1000: {prettyMessage: "Cannot sign-up because of unknown error.", code: 1000, statusCode: 400},
    1001: {prettyMessage: "Cannot sign-up because you're already connected to the system.", code: 1001, statusCode: 400},
    1002: {prettyMessage: "Cannot sign-up because your mail address is already in use.", code: 1002, statusCode: 400},
    1003: {prettyMessage: "Cannot login after signup.", code: 1003, statusCode: 400},


    1010: {prettyMessage: "Login Failed, Wrong Credentials.", code: 1010, statusCode: 400},
    1011: {prettyMessage: "Login Failed, User is not active. Please check your email for activation instructions.", code: 1011, statusCode: 400},
    1012: {prettyMessage: "Login Failed, User is blocked. Please contact support@appstr.io.", code: 1012, statusCode: 400},
    1013: {prettyMessage: "You have requested a new password. Please check your email.", code: 1013, statusCode: 400},
    1014: {prettyMessage: "Too many login attempts, Please wait" + (loginRetriesPeriodInMinutes ? (" " + loginRetriesPeriodInMinutes + "minutes...") : "..."), code: 1014, statusCode: 400},

    1020: {prettyMessage: "Cannot fetch user.", code: 1020, statusCode: 400},
    1021: {prettyMessage: "Cannot update user, wrong object.", code: 1021, statusCode: 400},
    1022: {prettyMessage: "Cannot update user because the email address is already in use.", code: 1022, statusCode: 400},
    1023: {prettyMessage: "Cannot delete user because user id was not supplied.", code: 1023, statusCode: 400},

    // errors related to ads_controller 1xxx
    2000: {prettyMessage: "Cannot generate ad because of unknown error.", code: 2000, statusCode: 400},
    2001: {prettyMessage: "Cannot generate ad because there are no campaigns available", code: 2001, statusCode: 400},
    2002: {prettyMessage: "Cannot generate ad because publisher id is not right", code: 2002, statusCode: 400},
    2003: {prettyMessage: "Cannot generate ad because publisher app is not active", code: 2003, statusCode: 400}

};

function HttpError(params) {
    Error.captureStackTrace(this, HttpError);
    var err;
    params = params || {};
    if (_.isNumber(params)) {
        err = errors[params];
    } else if (_.isString(params)) {
        params = {message: params};
    } else if (params.code) {
        err = errors[params.code];
    }

    if (err) {
        err.statusCode = params.statusCode || err.statusCode;
        err.message = params.message || err.message || err.prettyMessage;
        _.extend(this, err);
    } else {
        params.statusCode = params.statusCode || 500;
        params.message = params.message || "";
        params.code = params.code || 9999;
        _.extend(this, params);
    }
}

util.inherits(HttpError, Error);
HttpError.prototype.name = 'HttpError';

HttpError.prototype.toString = function () {
    return "[" + this.name + '] ' + this.statusCode + ' ' + this.message + '(' + this.code + ')';
};

module.exports = HttpError;