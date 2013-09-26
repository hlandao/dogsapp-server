/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    passport = require('passport');

/**
 * Auth callback
 */
exports.authCallback = function(req, res, next) {
    if(req.user){
        res.send(req.user.loggedUser);
    }else{
        res.send(401);
    }
};

/**
 * Show login form
 */
exports.signin = function(req, res) {
    res.render('users/signin', {
        title: 'Signin',
        message: req.flash('error')
    });
};

/**
 * Show sign up form
 */
exports.signup = function(req, res) {
    res.render('users/signup', {
        title: 'Sign up',
        user: new User()
    });
};

/**
 * Logout
 */
exports.signout = function(req, res) {
    req.logout();
    res.redirect('/');
};

/**
 * Session
 */
exports.session = function(req, res, next) {
    passport.authenticate('local', function (err, user, info) {
            if (err) return next(err);
            if(!user) return res.send(400);
            return req.login(user, function (err) {
                if (err) return next(err);
                return res.send(user.loggedUser);
            });

        }
    )(req, res, next);
};



/**
 * Get users list
 */
exports.all = function(req,res,next){
    User.find(function(err, users) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(users);
        }
    });

};


/**
 * Create user
 */
exports.create = function(req, res) {
    var user = new User(req.body);

    user.provider = 'local';
    // override use role if not admin
    if(!req.user || req.user.role < 2){
        user.role = 1;
    }


    User.find({}, function(err, users){
       if(!users && !err){
          user.role=2;
       }
        user.save(function(err) {
            if (err) {
                return res.send(400, err);
            }else{
                return res.send(user);
            }

        });

    });
};

/**
 *  Show profile
 */
exports.show = function(req, res) {
    var user = req.profile;

    res.render('users/show', {
        title: user.name,
        user: user
    });
};


/**
 * Update a user
 */
exports.update = function(req, res) {
    var user = req.user;

    user = _.extend(user, req.body);

    user.save(function(err) {
        res.jsonp(user);
    });
};


/**
 * Delete a user
 */
exports.destroy = function(req, res) {
    var user = req.profile;
    if(req.profile === req.user){
        return res.send(403, {message : "Cannot delete myself"});
    }
    user.remove(function(err) {
        if (err) {
            return res.send(500, {message : "Cannot delete user"});
        } else {
            res.jsonp(user);
        }
    });
};


/**
 * Send User
 */
exports.me = function(req, res) {
    console.log('req.user',req.user);
    res.jsonp(req.user || null);
};

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
    User
        .findOne({
            _id: id
        })
        .exec(function(err, user) {
            if (err) return next(err);
            if (!user) return next(new Error('Failed to load User ' + id));
            req.profile = user;
            next();
        });
};