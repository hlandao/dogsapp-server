var async = require('async');

module.exports = function(app, passport, auth) {
    //User Routes
    var users = require('../app/controllers/users');
    app.get('/signout', users.signout);

    //Setting the facebook oauth routes
    app.get('/auth/facebook', passport.authenticate('facebook', {
        scope: ['email', 'user_about_me'],
        failureRedirect: '/signin'
    }));
    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        failureRedirect: '/signin'
    }), users.authCallback);


    //Setting up the users api
    app.get('/users',auth.requiresLogin, auth.requiresRole(2), users.all);
    app.post('/users', users.create);
    app.put('/users/:userId', auth.requiresLogin, auth.requiresRole(2), users.update);
    app.del('/users/:userId', auth.requiresLogin, auth.requiresRole(2), users.destroy);


    app.post('/users/session', users.session);

    app.get('/users/me', users.me);
    app.get('/users/:userId', auth.user.hasAuthorization,  users.show);

    //Finish with setting up the userId param
    app.param('userId', users.user);


    //Home route
    var index = require('../app/controllers/index');
    app.get('/', index.render);

};