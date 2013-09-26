/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    _ = require('underscore'),
    authTypes = ['facebook', 'google'],
    jwt = require('jwt-simple'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env];




/**
 * User Schema
 */
var UserSchema = new Schema({
    name: String,
    email: {type: String, index: {unique: true, dropDups: true}},
    provider: String,
    hashed_password: String,
    salt: String,
    facebook: {},
    twitter: {},
    github: {},
    google: {},
    role : {type : Number, default : 1},
    createdAt: { type: Date, default: Date.now }
});

/**
 * Virtuals
 */
UserSchema.virtual('password').set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
}).get(function() {
    return this._password;
});

UserSchema.virtual('loggedUser').get(function(){
   return {
       name : this.name,
       email : this.email,
       access_token : this.generateJWTToken()
   }
});

/**
 * Validations
 */
var validatePresenceOf = function(value) {
    return value && value.length;
};

// the below 4 validations only apply if you are signing up traditionally
UserSchema.path('name').validate(function(name) {
    return true; // pass this validation temporary
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return name.length;
}, 'Name cannot be blank');

UserSchema.path('email').validate(function(email) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return email.length;
}, 'Email cannot be blank');


UserSchema.path('hashed_password').validate(function(hashed_password) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return hashed_password.length;
}, 'Password cannot be blank');


/**
 * Pre-save hook
 */
UserSchema.pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.password) && authTypes.indexOf(this.provider) === -1)
        next(new Error('Invalid password'));
    else
        next();
});

/**
 * Methods
 */
UserSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */
    makeSalt: function() {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */
    encryptPassword: function(password) {
        if (!password) return '';
        return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    },

    /**
     * check is user is admin
     * @returns {boolean}
     */
    isAdmin : function(){
        return (this.role >= 2)
    },

    /**
     * Generates token for access
     */
    generateJWTToken : function(){
        var tokenSecret = config.jwtToken.secret;

        var tokenObject = {
            _id : this._id,
            createdAt : Date.now(),
            expiredAt : Date.now() + config.jwtToken.expiracy
        };

        return {
            token : jwt.encode(tokenObject, tokenSecret),
            expiredAt : tokenObject.expiredAt
        }
    }
};

mongoose.model('User', UserSchema);