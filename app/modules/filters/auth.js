var mongoose = require('mongoose');

var errors = require('../errors/'),
    HttpError = errors.httpError,
    HttpValidateError = errors.httpValidateError;


/**
 * Check if user is authenecated and has enough permissions for the action
 *
 * @param role
 * @returns {Function MiddleWare}
 */

var requireAuth = function (role) {
    return function (next) {
        if(role === 0) return next();
        if (this.req.isAuthenticated() && this.req.user) {
            if (!role || role <= this.req.user.role) {
                next();
            } else {
                this.error(new HttpError(403));
            }
        } else {
            this.error(new HttpError(401));
        }
    }
};

/**
 * Middleware that check if the connected user is the same user we got from fetchUserById,
 * if not, we check if the connected user has privileges for the resource
 * @param connectedUser
 * @param userToCheck
 * @param adminRole
 * @param next
 * @returns {*}
 */
var verifyOwnerOrAdmin = function(userIdToCheck, adminRole){
    return function(next){
        if (!this.req.isAuthenticated() || !this.req.user) return this.error(new HttpError(401));

        if(_.isNumber(userIdToCheck)){
            adminRole = userIdToCheck;
            userIdToCheck = null;
        }

        if(!userIdToCheck){
            userIdToCheck = this.user_id = (this.resource && this.resource.user) ? this.resource.user :  this.param('user_id');
        }

        adminRole = adminRole || 2;

        var user = this.req.user;
        if(!user) this.error(new HttpError(401));

        if(userIdToCheck&& user._id.toString() == userIdToCheck.toString()) return next();
        else return requireAuth(adminRole).call(this,next);

    }
};

module.exports = {
    requireAuth: requireAuth,
    verifyOwnerOrAdmin : verifyOwnerOrAdmin
};