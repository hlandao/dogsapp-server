/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    Client = mongoose.model('Client'),
    _ = require('underscore'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env];



/**
 * Find Client by id
 */
exports.client = function(req, res, next, id) {
    var User = mongoose.model('User');

    Client.load(id, function(err, client) {
        if (err) return next(err);
        if (!client) return next(new Error('Failed to load Client ' + id));
        req.client = client;
        next();
    });
};

/**
 * Create a Client
 */
exports.create = function(req, res) {
    var client = new Client(req.body);

    client.user = req.user;
    client.save();
    res.jsonp(client);
};


/**
 * Update a Client
 */
exports.update = function(req, res) {
    var client = req.client;

    client = _.extend(client, req.body);

    client.save(function(err) {
        res.jsonp(client);
    });
};

/**
 * Delete an Client
 */
exports.destroy = function(req, res) {
    var client = req.client;

    client.remove(function(err) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.send(200);
        }
    });
};

/**
 * Show an Client
 */
exports.show = function(req, res) {
    res.jsonp(req.client);
};

/**
 * List of Articles
 */
exports.all = function(req, res) {
    Client.find().sort('-created').populate('user').exec(function(err, clients) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(clients);
        }
    });
};