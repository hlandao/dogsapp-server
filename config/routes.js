var async = require('async');

module.exports = function(app, passport, auth) {
    //User Routes
    var users = require('../app/controllers/users');
    app.get('/signin', users.signin);
    app.get('/signup', users.signup);
    app.get('/signout', users.signout);

    //Setting the facebook oauth routes
    app.get('/auth/facebook', passport.authenticate('facebook', {
        scope: ['email', 'user_about_me'],
        failureRedirect: '/signin'
    }), users.signin);
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

    //Article Routes
    var clients = require('../app/controllers/clients');
    app.get('/clients', clients.all);
    app.post('/clients', auth.requiresLogin, clients.create);
    app.get('/clients/:clientId',auth.requiresLogin, clients.show);
    app.put('/clients/:clientId', auth.requiresLogin, auth.client.hasAuthorization, clients.update);
    app.del('/clients/:clientId', auth.requiresLogin, auth.client.hasAuthorization, clients.destroy);


    //Finish with setting up the articleId param
    app.param('clientId', clients.client);

    //Home route
    var index = require('../app/controllers/index');
    app.get('/', index.render);

};