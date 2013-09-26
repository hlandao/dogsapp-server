/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.send(401, {message : "Not Authenticated"});
    }
    next();
};


/**
 * Generic authorization middleware, ensures the user has the appropriate role
 * @param role
 * @returns {Function}
 */
exports.requiresRole = function(role){
    return function(req, res, next) {
        if ((!req.user || !req.user.role) || req.user.role < role) {
            return res.send(403, {message : "Forbidden"});
        }
        next();
    }
};





/**
 * User authorizations routing middleware
 */
exports.user = {
    hasAuthorization: function(req, res, next) {
        if (req.profile._id != req.user._id  && !req.user.isAdmin()) {
            return res.send(403);
        }
        next();
    }
};

/**
 * Article authorizations routing middleware
 */
exports.client = {
    hasAuthorization: function(req, res, next) {
        if (req.client.user._id != req.user._id && !req.user.isAdmin()) {
            return res.send(403);
        }
        next();
    }
};