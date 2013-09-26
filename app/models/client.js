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
var ClientSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User'},
    chromeChannelId : {},
    createdAt: { type: Date, default: Date.now }

});

/**
 * Statics
 */
ClientSchema.statics = {
    load: function(id, cb) {
        this.findOne({
            _id: id
        }).populate('user').exec(cb);
    }
};

mongoose.model('Client', ClientSchema);