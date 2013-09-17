var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../../app/models/user');

// Use the LocalStrategy within Passport.

passport.use(new LocalStrategy({
    usernameField: 'email'
  },
  function(email, password, done) {
      //TODO:ADD VALIDATOR

      User.authenticate(email, password, function(err, user) {
          return done(err, user);
    });
  }
));

// Passport session setup.

passport.serializeUser(function(user, done) {
  done(null, user._id);
});


passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});