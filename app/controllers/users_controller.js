var locomotive = require('locomotive'),
    passport = require('passport'),
    User = require('../models/user'),
    auth = require('../modules/filters/auth'),
    uuid = require('node-uuid'),
    async = require('async'),
    randomToken = require('../modules/other/randomToken'),
    errors = require('../modules/errors/'),
    resourceGetter = require('../modules/filters/resourceGetter'),
    paginate = require('mongoose-paginate'),
    check = require('validator').check,
    sanitize = require('validator').sanitize,
    ip = require('../modules/other/ip');


var Controller = locomotive.Controller,
    UsersController = new Controller(),
    realm = locomotive.set('realm');

UsersController.model = User;

var HttpError = errors.httpError,
    HttpValidateError = errors.httpValidateError;

/**
 * GET /users
 * Get a list of all users as JSON.
 * Requires being an admin
 * @output [{users}]
 * Prints an array of users
 */

UsersController.index = function () {

    var self = this,
        page = this.param('page'),
        itemsPerPage = this.param('items') || 50,
        query = {};

    if (page && itemsPerPage) {
        query = {query: {}, page: page, itemsPerPage: itemsPerPage};
    }
    User.findAccessible(query, self.req.user, function (err, pagesCount, _users) {
        if (err) return self.error(err);

        var json = {};
        if (_.isArray(pagesCount)) {
            json = pagesCount;
        } else {
            json.users = _users;
            json.pagesCount = pagesCount;
        }
        return self.response.send(json);
    });
};

/**
 * GET /users/:id
 * @return {user}
 * Prints a user schema of current user accessible attributes
 */

UsersController.show = function () {
    if (!this.resource) return this.error(new HttpError(1020));
    return this.response.send(this.resource.publicDetails);
};

/**
 * POST /users
 * Register - creates new user
 * @param email
 * @param password
 * @param firstName
 * @param lastName
 * @output 200
 */

UsersController.create = function () {

    //if user is already logged in and he isn't an admin
    if (this.req.user && this.req.user.role < 2) return this.error(new HttpError(1001));

    var self = this,
        _newUser = new User;

        var password = this.param('password');
        var email = this.param('email');

        _newUser.password = password;
        _newUser.email = email;



        // get ip and cc
        var ipAndCountry = ip.getIpCountryFromRequest(self.req);

        if (ipAndCountry.ip) _newUser.ip = ipAndCountry.ip;
        if (ipAndCountry.cc) _newUser.cc = ipAndCountry.cc;


        //make sure email isn't in the system already
        return User.findOne({email: email}, function (err, foundUser) {

            if (err) return self.error(new HttpError(err));

            //if there isn't a user with this email
            if (!foundUser) {

                _newUser.activationToken = randomToken();

                return _newUser.save(function (err, savedUser) {

                    if (err) {
                        if (err.code === 11000) return self.error(new HttpError(1002));
                        else return self.error(err);
                    }

                    if (locomotive.env !== 'testing') {
                        //send email from background process
                        //savedUser.sendVerificationMail();
                    }

                    return self.__req.login(savedUser, function (err) {
                        console.log('login err',err);
                        if (err) return self.error(new HttpError(1003));

                        return self.response.send(savedUser.publicDetails);
                    });

                });
            }
            //email address is already in use
            else {
                return self.error(new HttpError(1002));
            }
        });
};


/**
 * put /users/:id
 * @output {user}
 */

UsersController.update = function () {
    if (!this.resource) return this.error(new HttpError(1021));
    if (!this.id && !this.resource._id) return this.error(new HttpError(1021));

    var self = this,
        user = self.resource;

    return user.getAccessibleParamsFromRequest(self.req.user, self, 'update', function (err) {
        if (err) return self.error(new HttpValidateError(err));

        return user.save(function (err, _user) {
            if (err) return self.error(err);

            return self.response.send(user.cloneAccessible(self.req.user));

        });
    });
};


/**
 * delete /users/:id
 * @output {user}
 */

UsersController.destroy = function () {
    var self = this;

    var user_id = self.param('id');
    if (!user_id) return self.error(new HttpError(1023));
    if (!this.resource)  return self.error(new HttpError(1023));

    this.resource.removeNestedResources(function (err) {
        if (err) return self.error(err);

        return User.remove({_id: user_id}, function (err) {
            if (err) return self.error(err);
            return self.response.send(200);

        });

    });
};


/**
 * POST /login
 * @output {user}
 */
UsersController.login = function () {
    var self = this;
    passport.authenticate('local', function (err, user, info) {
            if (err) return self.error(err);
            return self.__req.login(user, function (err) {
                if (err) return self.error(err);
                return self.response.send(user.publicDetails);
            });

        }
    )(self.__req, self.__res, self.__next);
};

/**
 * POST /check_password
 * @output {user}
 */
UsersController.checkPassword = function () {
    var self = this;
    var password = this.param('password'); // TODO ADD VALIDATORS

    if(!this.req.user){
        return self.error(new HttpError(401));
    }else if(!password){
        return self.error(new HttpError('No password provided'));

    }

    this.req.user.checkPassword(password, function(err, passwordCorrect){
        if(err) self.error(err);

        if(passwordCorrect){
           return self.response.send(200);
        }else{
            return self.error(new HttpError(1010));
        }
    });

};


/**
 * GET /logout
 * Logs the user out of the system
 */
UsersController.logout = function () {
    this.req.logout();
    this.redirect('/');
};

/**
 * POST /password/forgot
 * User posts his email in order to renew his password
 * @
 */
UsersController.passwordForgot = function () {
    var self = this;
    var email = self.param('email');
    User.recoverPassword(email, function (err) {
        if (err) return self.error(err);
        else self.res.send(200);
    });
};

/**
 * Replaces the newPasswordToken (so it be one time token) and render the normal view with the new token
 * @render home/index
 */
UsersController.passwordResetForm = function () {
    var self = this;
    var newPasswordToken = self.param('token'); // TODO validate
    if (!newPasswordToken) return self.redirect('/');

    User.findOne({newPasswordToken: newPasswordToken}, function (err, user) {
        //todo possibly send error to client for an overlay message
        if (err) return self.redirect('/');
        if (!user) return self.redirect('/');

        user.newPasswordToken = randomToken();
        user.save(function (err) {
            //todo possibly send error to client for an overlay message
            if (err) return self.redirect('/');
            self.tokens = {newPasswordToken: user.newPasswordToken};
            return self.render('home/index');
        });

        return true;
    });

    return true;
};


/**
 * POST /password/reset
 * Will reset the password to the new token
 * @
 */
UsersController.passwordReset = function () {
    var newPasswordToken = this.param('newPasswordToken'); // TODO validate
    if (!newPasswordToken) return this.error(new HttpError('Cannot reset the password'));

    var self = this;

    var newPass = self.param('password'); // TODO validate

    //find user by newPasswordToken
    return User.findOne({newPasswordToken: newPasswordToken}, function (err, user) {
        if (err) return self.error(err);
        if (!user) return self.error(new HttpError('Cannot find the user'));

        //remove user newPasswordToken

        user.newPasswordToken = undefined;
        user.password = newPass;

        user.save(function (err) {
            if (err) return self.error(err);
            return self.response.send(200);
        });
    });
};


/**
 * Get /activate/:token
 * @redirect /activation/error or /activation/success
 */

UsersController.resendVerificationMail = function () {
    var self = this;
    var email = this.param('email');
    try {
        check(email).notNull().isEmail();
    } catch (e) {
        return self.response.send(400);
    }

    User.findOne({email: email}, function (err, user) {
        if (err) return self.response.send(400);
        user.sendVerificationMail(function (err) {
            if (err) return self.response.send(400);
            self.response.send(200);
        });
    });

};


/**
 * Get /activate/:token
 * @redirect /activation/error or /activation/success
 */

UsersController.activate = function () {

    var token = this.param('token'); //TODO add validate
    if (!token || token.length < 2) return self.redirect('/login');

    var self = this;

    User.findOne({activationToken: token}, function (err, user) {
        if (err) return self.redirect('/activation/error');
        if (!user) return self.redirect('/activation/error');

        if (!user.blocked) {

            user.active = 1;
            user.activationToken = undefined;

            //save new user active status and clear activation Token
            user.save(function (err) {
                if (err) return self.redirect('/activation/error');

                return self.redirect('/activation/success');
            });
        }
        //TODO user is blocked for trying too many times
        else {
        }
    });

    return true;
};




/**
 * Custom middlewares for users_controller
 */


/* BEFORE INDEX */
UsersController.before('index', function (next) {
    auth.requireAuth(2).call(this, next);
});


/* BEFORE SHOW */
// then verify privileges
UsersController.before('show', resourceGetter());
UsersController.before('show', function (next) {
    auth.verifyOwnerOrAdmin(this.resource._id, 2).call(this, next);
});

/* BEFORE UPDATE */
// then verify privileges
UsersController.before('update', resourceGetter());
UsersController.before('update', function (next) {
    auth.verifyOwnerOrAdmin(this.resource._id, 2).call(this, next);
});

/* BEFORE DESTROY */
// check if user is a super admin
UsersController.before('destroy', function (next) {
    auth.requireAuth(3).call(this, next);
});
UsersController.before('destroy', resourceGetter());


/* BEFORE sendActivationMail */
UsersController.before('sendActivationMail', function (next) {
    auth.requireAuth(2).call(this, next);
});
UsersController.before('sendActivationMail', resourceGetter());




module.exports = UsersController;