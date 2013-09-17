// generic settings
var express = require('express');
var passport = require('passport');
var errorHandler = require('../../app/modules/middleware/errorHandler');
var RedisStore = require('connect-redis')(express);
var redis = require('redis');

module.exports = function () {
    var self = this;

    // init redis before session
    var redisConfig = this.set('redis');
    var redisClient = redis.createClient(redisConfig.port, redisConfig.host);
    redisClient.auth(redisConfig.password, function (err) {
        if (err) throw err;
    });

    redisClient.once('ready', function () {
        self.logger.info('Redis client ready');
    });

    this.set('redisClient', redisClient);

    var sessionStore;

    if (this.set('sessionStoreType') === 'redis') {
        sessionStore = new RedisStore({ client: redisClient });
    }


    this.use(express.favicon(__dirname + '/../../public/img/favicon.ico'));
    this.use(express.cookieParser());
    this.use(express.cookieSession({secret : "this is a secret ! ! !"}));
    this.use(express.bodyParser());

    var sessionFiltering = function (disallowPaths, cb) {
        return function (req, res, next) {
            if (~disallowPaths.indexOf(req.url)) {
                return next();
            }
            return cb(req, res, next);
        }
    };


    this.use(express.session({ secret: 'the best secret in the world', store: sessionStore, cookie: {maxAge: 1800000}}));


    this.use(passport.initialize());
    this.use(passport.session());


    var loggerConfig = this.set('loggerConfig') || {};
    this.use(express.logger(loggerConfig));

    if (!this.set('maxLoginRetries')) this.set('maxLoginRetries', 10);
    if (!this.set('loginRetriesPeriod')) this.set('loginRetriesPeriod', 1000 * 60 * 5);

};