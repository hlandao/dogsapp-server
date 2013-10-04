var jwt = require('jwt-simple'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env];


module.exports = function(){
    return function(req,res,next){
        var property = req._passport.instance._userProperty || 'user';
        var tokenSecret = config.jwtToken.secret;

        if(req[property]) return next();
        console.log('req.headers.access_token',req.headers.access_token);
        if(req.headers.access_token){
            var tokenObject = jwt.decode(req.headers.access_token, tokenSecret);
            if(Date.now() > tokenObject.expired){
                // token is expired
                return next();
            }else{
                var su = tokenObject._id;
                req._passport.instance.deserializeUser(su, function(err, user) {
                    if (err) { return next(); }
                    if (!user) {
                        return next();
                    };

                    req[property] = user;
                    next();
                });

            }
        }else{
            next();
        }
    }
}