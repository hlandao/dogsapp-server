/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    IM = mongoose.model('IM'),
    _ = require('underscore'),
    async = require('async'),
    passport = require('passport'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env];
    knox = require('knox'),
    randomstring = require("randomstring");


var knoxClient = knox.createClient(config.S3);


/**
 * Auth callback
 */
exports.authCallback = function(req, res, next) {
    if(req.user){
        res.send(req.user.loggedUser);
    }else{
        res.send(401);
    }
};


/**
 * Logout
 */
exports.signout = function(req, res) {
    req.logout();
    res.send(200);
};

/**
 * Session
 */
exports.session = function(req, res, next) {
    passport.authenticate('local', function (err, user, info) {
            if (err) return next(err);
            if(!user) return res.send(400);
            return req.login(user, function (err) {
                if (err) return next(err);
                return res.send(user.loggedUser);
            });

        }
    )(req, res, next);
};



/**
 * Get users list
 */
exports.all = function(req,res,next){
    User.find(function(err, users) {
        if (err) {
            res.send(500);
        } else {
            res.jsonp(users);
        }
    });

};


/**
 * Create user
 */
exports.create = function(req, res) {
    var user = new User(req.body);
    var base64Image = req.body.base64Image;

    user.provider = 'local';
    // override use role if not admin
    if(!req.user || req.user.role < 2){
        user.role = 1;
    }


    User.find({email : user.email}, function(err, users){
        if(err) return res.send(500, {error : 'cannot fetch users'});

        getNewUserThumbnail(base64Image, function(err, imageUrl){
            if(err) return res.send(500,  {error : 'cannot upload thumbnail'});

            user.dog.thumbnail = imageUrl;
            user.save(function(err) {
                if (err) {
                    console.log('err',err);
                    return res.send(400, {error : err});
                }else{

                    return req.login(user, function (err) {
                        if (err) return next(err);
                        return res.send(user.loggedUser);
                    });

                }

            });


        });

    });
};


/**
 * upload base64image to server OR return the default
 * @param base64Image
 * @param done
 */
var defaultThumbnailUrl = "http://icons.iconarchive.com/icons/turbomilk/zoom-eyed-creatures/256/dog-icon.png";
var getNewUserThumbnail = function(base64Image, done){
    if(!base64Image) return done && done(null, defaultThumbnailUrl);

    var filename = generateFilename('th_','png');
    uploadBase64(base64Image,filename, done);
};

/**
 * upload a base64 image to S3 and return the uploaded  image url
 * @param base64Image
 * @param filename
 * @param done
 */
var uploadBase64 = function(base64Image, filename, done){
    filename = filename || generateFilename('anon');
    var buf = new Buffer(base64Image.replace(/^data:image\/\w+;base64,/, ""),'base64');

    var req = knoxClient.put('/images/'+filename, {
        'Content-Length': buf.length,
        'Content-Type':'image/png'
    });

    req.on('response', function(res){
            if (res.statusCode === 200){
                done && done(null, req.url);
            }else{
                done && done('Error uploading image');
            }
        }
    );

    req.end(buf)

};


/**
 * generate random file name
 * @param prefix
 * @param suffix
 * @returns {string}
 */
var generateFilename = function(prefix,suffix){
    prefix = prefix || "";
   return prefix + randomstring.generate(5) + '.' + suffix;
};

/**
 *  Show profile
 */
exports.show = function(req, res) {
    var user = req.profile;

    res.send(user);
};


/**
 * Update a user
 */
exports.update = function(req, res) {
    var user = req.user;

    user = _.extend(user, req.body);

    user.save(function(err) {
        res.jsonp(user);
    });
};


/**
 * Delete a user
 */
exports.destroy = function(req, res) {
    var user = req.profile;
    if(req.profile === req.user){
        return res.send(403, {message : "Cannot delete myself"});
    }
    user.remove(function(err) {
        if (err) {
            return res.send(500, {message : "Cannot delete user"});
        } else {
            res.jsonp(user);
        }
    });
};


/**
 * Send User
 */
exports.me = function(req, res) {
    res.jsonp(req.user || null);
};

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
    User
        .findOne({
            _id: id
        })
        .exec(function(err, user) {
            if (err) return next(err);
            if (!user) return next(new Error('Failed to load User ' + id));
            req.profile = user;
            next();
        });
};


/**
 * update my location
 */
exports.updateLocation = function(req, res){
    var user = req.user;
    var loc = req.body.loc;

    user.setLocation(loc, function(err){
       if(err){
           console.log(err);
           return res.send(400, {error : 'error in update location'});
       }else{
           // get around me
           user.findNear({}, function(err, profiles){
               if(err){
                   console.log(err);
                   return res.send(400, {error : 'error getting users around me'});
               }else{
                   IM.unNotifiedForUser(req.user._id, function(err, notifications){
                       return res.send({aroundMe : profiles, notifications : notifications});
                   });

               }
           });
       }
    });
};

/**
 * get users around my last location or around ceratin location
 */
exports.aroundMe = function(req, res){
    var loc = req.body.loc;
    console.log('around me loc',loc);
    var maxDistance = req.body.distance || 1;
    var oldTimeout = req.body.oldTimeout || 1000 * 60 * 10000;

    var user = req.user;

    user.findNear({loc : loc, maxDistance : maxDistance, oldTimeout : oldTimeout}, function(err, profiles){
        if(err){
            console.log(err);
            return res.send(400, {error : 'error getting users around me'});
        }else{
            return res.send(profiles);
        }
    });
};


/**
 * send im message to another user
 */
exports.sendIM = function(req, res){
    var message = new IM(req.body);
    message.from = req.user._id;

    console.log('message,message',message);

    User.findOne({_id : message.to}, function(err, toUser){
        if(err){
            return res.send(400,'Cannot find to user');
        }else{
            message.save(function(err){
                if(err){
                    return res.send(400,'Cannot save message');
                }else{
                    toUser.addToInbox(req.user, function(err){
                        req.user.addToInbox(toUser, function(err){
                            return res.send(message);
                        });

                    });
                }
            });

        }


    });

};


/**
 * send im message to another user
 */
exports.chatHistory = function(req, res){
    var withUser = req.body.withUser;

    IM.findChatHistory(req.user._id, withUser, function(err, history){
        if(err){
            return res.send(400,'Cannot find chat history');
        }else{
            return res.send(history);
        }
    });

};



/**
 * send im message to another user
 */
exports.inbox = function(req, res){
    if(!req.user.inbox){
        return res.send(200);
    }

    async.map(req.user.inbox, function(userId, cb){
        User.findOne({_id : userId}, function(err, _user){
           if(err) return cb(err);
           return cb(null, _user.profile);
        })
    }, function(err, profiles){
       if(err) return res.send(500, {error : 'Cannot get inbox'});
        res.send(profiles);
    });


};
