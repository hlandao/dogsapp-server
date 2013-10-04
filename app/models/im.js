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
 * Instant Messages Schema
 */
var IMSchema = new Schema({
    channel_id: String,
    from: {type: Schema.ObjectId, ref : 'User'},
    to: {type: Schema.ObjectId, ref : 'User'},
    message : String,
    notified : {type : Boolean, default : false},
    opened : {type : Boolean, default : false},
    createdAt: { type: Date, default: Date.now }
});

/**
 * Validations
 */
var validatePresenceOf = function(value) {
    return value && value.length;
};

// the below 4 validations only apply if you are signing up traditionally
IMSchema.path('channel_id').validate(function(channel_id) {
    return channel_id.length;
}, 'Channel Id cannot be blank');

IMSchema.path('from').validate(function(from) {
    return from.length;
}, 'From user cannot be blank');


IMSchema.path('to').validate(function(to) {
    return to.length;
}, 'To User cannot be blank');

IMSchema.path('message').validate(function(message) {
    return message.length;
}, 'Message cannot be blank');


/**
 * Pre-save hook
 */
IMSchema.pre('save', function(next) {
    this.channel_id = generateChannelIdForUsers(this.from,this.to);
    next();
});



var generateChannelIdForUsers = function(userAId,userBId){
     if(userAId > userBId){
         return userAId + "_" + userBId;
     }else{
         return userBId + "_" + userAId;
     }
};


/**
 * Methods
 */

/**
 * get history chat from two users
 * @param userAId
 * @param userBId
 * @param done
 */
IMSchema.statics.findChatHistory = function(userAId, userBId, done){
    var channelId = generateChannelIdForUsers(userAId, userBId);
    this.find({channel_id : channelId}, done);
};


IMSchema.statics.unNotifiedForUser = function(user, done){
    this.find({notified : false, opened : false, to : user}).populate('from').exec(done);
};



IMSchema.methods = {
};

mongoose.model('IM', IMSchema);