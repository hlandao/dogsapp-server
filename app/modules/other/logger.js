/**
 * Created with JetBrains WebStorm.
 * User: omriklinger
 * Date: 8/5/13
 * Time: 10:39 AM
 * To change this template use File | Settings | File Templates.
 */
var winston = require('winston'),
    Loggly = require('winston-loggly').Loggly;

winston.remove(winston.transports.Console);


function Logger() {

    this.log = winston.log;
    this.debug = winston.debug;
    this.info = winston.info;
    this.warn = winston.warn;
    this.error = winston.error;
    this.once = winston.once;

    this.format = {
      short: '{"method":":method", "url":":url", "statusCode":":status", "responseTime":":response-time" }',
      long: '{"method":":method", "url":":url", "statusCode":":status", "responseTime":":response-time", "userAgent":":user-agent" }'
    };

    this.profile = winston.profile;

    this.addConsole = function (options) {
        winston.add(winston.transports.Console, options);
    };

    this.addLoggly = function (options) {
        winston.add(winston.transports.Loggly, options);
    };

    this.__defineGetter__("requestJsonStream", function () {
        var that = this;
        return {
            write: function (message, encoding) {
                try {
                    var json = JSON.parse(message);
                    json.statusCode = Number(json.statusCode);
                    json.responseTime = Number(json.responseTime);
                } catch (err) {
                    that.error('Error parsing request logger JSON string', { error: err.toString() });
                    json = { jsonString: message };
                }
                var level;
                if (json.statusCode >= 500) {
                    level = 'error';
                } else if (json.statusCode >= 400) {
                    level = 'warn';
                } else {
                    level = 'info';
                }
                that.log(level, 'Request', json);
            }
        };
    });
}

module.exports = new Logger();

