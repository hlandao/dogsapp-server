var locomotive = require('locomotive'),
    validate = require('mongoose-validator').validate,
    bcrypt = require('bcrypt'),
    errors = require('../modules/errors/'),
    usersMailer = require('../mailer/users/users_mailer.js'),
    randomToken = require('../modules/other/randomToken'),
    ip = require('../modules/other/ip'),
    check = require('validator').check,
    sanitize = require('validator').sanitize,
    async = require('async'),
    User;

var mongoose = locomotive.mongoose,
    Schema = mongoose.Schema,
    Email = mongoose.SchemaTypes.Email,
    realm = locomotive.set('realm'),
    HttpError = errors.httpError,
    HttpValidateError = errors.httpValidateError;


var maxLoginRetries = locomotive.set('maxLoginRetries');
var loginRetriesPeriod = locomotive.set('loginRetriesPeriod');


/**
 *
 * @type {mongoose.Schema}
 */
var emailValidator = [validate('isEmail')];
var firstNameValidator = [validate({message: "First name should between 3 to 20 chars."}, 'len', 3, 20), validate('isAlphanumeric')];
var lastNameValidator = [validate('len', 3, 20), validate('isAlphanumeric')];
var urlValidator = [validate({message: 'A valid URL is required'}, 'isUrl')];
var roleValidator = [validate({message: 'Role should be an integer'}, 'isInt'), validate({message: 'Role should be greater than 0'}, 'min', 1), validate({message: 'Role should be less than or equal to 3'}, 'max', 3)];
var balanceValidator = [validate({message: 'Balance should be an integer'}, 'isInt'), validate({message: 'Balance should be greater than or equal to -250'}, 'min', -250)];
var tokenValidator = [validate('regex', /[a-zA-Z0-9$]{0,64}/), validate('len', 0, 64)];
var dateValidator = [validate('isDate')];
var loginRetiresValidator = [validate('isInt')];
var ipValidator = [validate('isIP'), validate('len', 0, 30)];
var ccValidator = [validate('isAlphanumeric'), validate('len', 0, 3)];
var commentValidator = [validate('len', 0, 200)];
var UserSchema = new Schema({
    // eMail address
    email: { type: Email, unique: true, required: true, validate: emailValidator},

    // Password
    salt: { type: String, required: true },
    hash: { type: String, required: true },

    firstName: { type: String, required: false, validate: firstNameValidator},
    lastName: { type: String, required: false, validate: lastNameValidator},
    role: { type: Number, required: false, default: 1, validate: roleValidator}, /* 1 - same user resource, 2 - admin, 3 - super admin */


    active: { type: Boolean, required: false },

    newPasswordToken: { type: String, required: false, validate: tokenValidator},
    activationToken: { type: String, required: false, validate: tokenValidator},

    lastLoginAttempt: { type: Date, required: false, validate: dateValidator},
    loginRetries: { type: Number, required: false, validate: loginRetiresValidator},

    lastRecoverPassword: { type: Date, required: false, validate: dateValidator},
    recoverPasswordRetries: { type: Number, required: false, validate: loginRetiresValidator},

    lastVerificationEmail: { type: Date, required: false, validate: dateValidator},
    verificationEmailRetries: { type: Number, required: false, validate: loginRetiresValidator},

    ip: { type: String, required: false, validate: ipValidator},
    cc: { type: String, required: false, validate: ccValidator},

    createdAt: { type: Date, required: false, validate: dateValidator, default: Date.now }
});




/**
 * Define password as virtual field
 */
UserSchema.virtual('password').get(function () {
    return this._password;
}).set(function (password) {
        this._password = password;
        var salt = this.salt = bcrypt.genSaltSync(10);
        this.hash = bcrypt.hashSync(password, salt);
    });

/**
 * Define Activation link as virtual field
 */
UserSchema.virtual('activationLink').get(function () {
    if (!this.activationToken) return false;
    return realm + '/activate/' + this.activationToken;

});

/**
 * Define Activation link as virtual field
 */
UserSchema.virtual('publicDetails').get(function () {
    return     {
        _id : this._id,
        email : this.email
    }
});



/**
 * Define Activation link as virtual field
 */
UserSchema.virtual('newPasswordLink').get(function () {
    if (!this.newPasswordToken) return false;
    return realm + '/password/reset/' + this.newPasswordToken;
});


/**
 * Return new user email format
 */
UserSchema.virtual('newUserEmailObject').get(function () {
    return {
        firstName: this.firstName,
        email: this.email,
        activationLink: this.activationLink
    };
});


/**
 * Return password recovery email format
 */
UserSchema.virtual('passwordRecoveryEmailObject').get(function () {
    return {
        firstName: this.firstName,
        email: this.email,
        newPasswordLink: this.newPasswordLink
    };
});


/**
 * Compare passwords
 */
UserSchema.method('checkPassword', function (password, callback) {
    bcrypt.compare(password, this.hash, callback);
});


/**
 * Authenticate users by email and password
 */
UserSchema.static('authenticate', function (email, password, callback) {
    var now = Date.now();
    this.findOne({ email: email }, function (err, user) {
        if (err) return callback(err);

        if (!user) return callback(new HttpError(1010), false);

        if (user.lastLoginAttempt && now - user.lastLoginAttempt <= loginRetriesPeriod && user.loginRetries >= maxLoginRetries) {
            return callback(new HttpError(1014), false);
        }

        user.checkPassword(password, function (err, passwordCorrect) {
            if (err) return callback(err);

            var loginError;

            if (!passwordCorrect) loginError = 1010;
           // if (user.needsActivation()) loginError = 1011; //TODO
            if (user.blocked) loginError = 1012;
            if (user.newPasswordToken) loginError = 1013;

            user.lastLoginAttempt = now;

            if (loginError) {
                user.loginRetries = (user.loginRetries) ? ++user.loginRetries : 1;
                return user.save(function (err) {
                    if (err) return callback(err);
                    return callback(new HttpError(loginError), false);
                });
            }

            user.loginRetries = 0;
            return user.save(function (err) {
                if (err) return callback(new HttpError('Could not save user'));
                return callback(null, user);
            });
        });
    });
});

/**
 * Send password recovery email
 * allowed 5 mials in 5 minutes
 */

UserSchema.static('recoverPassword', function (email, done) {
    this.findOne({email: email}, function (err, user) {
        if (err) return done(err);

        //if !user or !email than the email or user doesn't exist in db
        if (!user || !user.email) return done(new HttpError(420));

        var now = Date.now();

        // allow only 5 recoveries in 5 minutes
        if (user.lastRecoverPassword && now - user.lastRecoverPassword < 1000 * 60 * 5) {
            if (user.recoverPasswordRetries && user.recoverPasswordRetries >= 5) {
                return done(new Error('Cannot recover password, please wait 5 minutes before trying again'));
            }
        } else {
            user.recoverPasswordRetries = 0;
        }

        user.newPasswordToken = randomToken();
        user.lastRecoverPassword = now;
        user.recoverPasswordRetries = (!user.recoverPasswordRetries) ? 1 : user.recoverPasswordRetries + 1;

        user.save(function (err) {
            if (err) return done(err);

            //actually send email
            if (locomotive.env !== 'testing') {
                locomotive.resque.enqueue('email', 'usersMailer', ['passwordRecoveryMailer', {user: user.passwordRecoveryEmailObject}]);
            }
            done(null, true);
        });
    });
});


/**
 * Checks whether the user needs activation to login
 * (more than one day since sign up)
 */
UserSchema.methods.needsActivation = function () {
    var now = Date.now();
    var oneDay = 1000 * 3600 * 24;
    return (!this.active && now - this.createdAt > oneDay )
};

/**
 * Send verification mail for user, allowed 5 mails in 5 minutes
 */
UserSchema.methods.sendVerificationMail = function (done) {
    var user = this;
    var now = Date.now();

    // allow only 5 verification mails in 5 minutes
    if (user.lastVerificationEmail && now - user.lastVerificationEmail < 1000 * 60 * 5) {
        if (user.verificationEmailRetries && user.verificationEmailRetries >= 5) {
            return done(new Error('Cannot recover password, please wait 5 minutes before trying again'));
        }
    } else {
        user.verificationEmailRetries = 0;
    }

    locomotive.resque.enqueue('email', 'usersMailer', ['newUserMailer', {user: this.newUserEmailObject}]);
    user.lastVerificationEmail = now;
    user.verificationEmailRetries = (!user.verificationEmailRetries) ? 1 : user.verificationEmailRetries + 1;
    user.save(done);
};


/**
 * Removes all the user's data, both campaigns and apps from the system - cannot be undone
 * Used by the users_controller::destroy action
 * @param done
 */
UserSchema.methods.removeNestedResources = function (done) {
    done();
};


module.exports = User = mongoose.model('User', UserSchema);
