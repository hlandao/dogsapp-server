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
    google: {},
    role : {type : Number, default : 1},
    dog : {
        name : String,
        thumbnail : String
    },
    loc : {type : [Number], index : '2d'},
    locTimestamp : Date,
    inbox : [{type: Schema.ObjectId, ref : 'User'}],
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

// output after login/create
UserSchema.virtual('loggedUser').get(function(){
   return {
       _id : this._id,
       name : this.name,
       email : this.email,
       access_token : this.generateJWTToken()
   }
});

// public profile
UserSchema.virtual('profile').get(function(){
    return {
        _id : this._id,
        name : this.name,
        email : this.email,
        dog : this.dog,
        loc : this.loc
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

    if (!validatePresenceOf(this.password))
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
    },


    /**
     * set new user location and update location timestamp
     * @param loc
     * @param done
     */
    setLocation : function(loc, done){
        if(!loc) return done('no location provided');

        this.loc = loc;
        this.locTimestamp = Date.now();
        this.save(done);
    },


    /**
     * find users who near the user or near a specific location
     * @param params (loc[optional], locTimeout[optional], maxDistance[optional])
     * @param done
     * @returns {*}
     */
    findNear : function(params, done){
        var self = this;
        params = _.extend({
            oldTimeout : 1000 * 60 * 9000,
            maxDistance : 1,
            loc : self.loc
        }, params);

        var oldDate = Date.now() - params.oldTimeout;

        return this.model('User').find({loc: { $nearSphere: params.loc, $maxDistance: params.maxDistance}, locTimestamp : {$gt: oldDate}, _id: {$ne : this._id}}, function(err, users){
            if(err) return done && done(err);
            var profiles = _.map(users, function(_user){
                return _user.profile;
            });

            done && done (null, profiles);


        });
    },


    /**
     * add message to inbox (push or update the position of the sender's id in the inbox array
     * @param message
     */
    addToInbox : function(user, done){
        var userId = user._id;
        if(!userId) return done && done('cannot add to inbox, no user id');
        var index = this.inbox.indexOf(userId);
        if(index === -1){
            this.inbox.unshift(userId);
            this.save(done);
        }else{
            this.inbox.splice(index,1);
            this.inbox.unshift(userId);
            this.save(done);
        }
    }
};

mongoose.model('User', UserSchema);