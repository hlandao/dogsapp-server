var jwt = require('jwt-simple');

module.exports = function(){
    return function(req,res,next){
        var property = req._passport.instance._userProperty || 'user';
        var tokenSecret = "abcdefghijklmnop";

        if(req[property]) return next();
        if(req.headers.token){
            var tokenObject = jwt.decode(req.headers.token, tokenSecret);
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