/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('underscore'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env];




/**
 * Dog Schema
 */
var DogSchema = new Schema({
    name: String,
    secret : String,
    thumbnail: {type: String},
    createdAt: { type: Date, default: Date.now }
});


/**
 * Validations
 */
var validatePresenceOf = function(value) {
    return value && value.length;
};

DogSchema.path('name').validate(function(name) {
    return name.length;
}, 'Name cannot be blank');



/**
 * Pre-save hook
 */
DogSchema.pre('save', function(next) {
    if (!this.isNew) return next();
    this.secret = this.makeSalt();
    next();
});



/**
 * Methods
 */
DogSchema.methods = {

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */
    makeSalt: function() {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    }
}


mongoose.model('Dog', DogSchema);