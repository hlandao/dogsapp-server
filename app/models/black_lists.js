/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env],
    Schema = mongoose.Schema;


/**
 * Place Schema
 */
var BlackListSchema = new Schema({
    name : String,
    sites: [String],
    createdAt: { type: Date, default: Date.now }
});

/**
 * Statics
 */
BlackListSchema.statics = {
    load: function(id, cb) {
        this.findOne({
            _id: id
        }).populate('user').exec(cb);
    }
};

mongoose.model('BlackList', BlackListSchema);