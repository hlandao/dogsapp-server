var  paginate = require('mongoose-paginate');
/**
 * Plugin for Mongoose schemas to allow authorize the accessible attributes by user's role.
 * the schema should have the 'ap' (= attrsPermissions) configuration as following :
 *
 * option1: same configuration for view, add, edit
 *
 *  UserSchema.attrsPermissions = {
 *       0 : ['email','password','website','firstName','lastName'], // public
 *       2 : ['role','balance','active','blocked','accountManager','lastLoginAttempt','loginRetries'] //admin
 *  };
 *
 * option2: detailed configuration for view, add, update (if update not specified, uses the add configuration)
 *
 *  UserSchema.attrsPermissions = {
 *      view : {
 *           0 : ['email','password','website','firstName','lastName'], // public
 *           2 : ['role','balance','active','blocked','accountManager','lastLoginAttempt','loginRetries'] //admin
 *      },
 *      add : {
 *           0 : ['email','password','website','firstName','lastName'], // public
 *           2 : ['role','balance','active','blocked','accountManager','lastLoginAttempt','loginRetries'] //admin
 *      }...
 *  };
 *
 * @param schema - a mongoose schema
 * @param options - mongoose schema options
 * @returns {Function-A Mongoose Plugin}
 */
module.exports = function (schema, options) {

    /**
     * Query the collection returning accessible attrs only
     * @param query - a find query
     * @param connectedUser - the user requesting the query
     * @param done - callback
     */
    schema.statics.findAccessible = function (queryObject, connectedUser, done) {
        var query, page, itemsPerPage;
        if(queryObject.query){
            query = queryObject.query;
            page =  queryObject.page;
            itemsPerPage = queryObject.itemsPerPage || 10;
        }else{
            query = queryObject;
        }

        if(!query) return done('error');

        var ap = attrsAccessibleForUser(connectedUser, 'view'),
            fields;

        ap = ap || [];
        fields = ap.join(' ');


        //clean up all fields of users and return only keys
        if(!page && page !== 0){
            this.find(query, fields, done);
        }else{
            this.paginate(query, page, itemsPerPage, done);
        }

    };


    /**
     * Modifies the array of documents, create a clone for each document including accessible attributes only
     * @param arr - array of documents
     * @param user - user requesting the array
     */
    var cloneAccessibleArray = schema.statics.cloneAccessibleArray = function (arr, connectedUser) {
        for (var i = 0; i < arr.length; ++i) {

            if (arr[i].cloneAccessible) {
                arr[i] = arr[i].cloneAccessible(connectedUser);
            }
        }
        return arr;
    };


    /**
     * Create a clone of accessible attributes only
     * @param connectedUser - user requesting to change or create a resource
     */
    var cloneAccessible = function (connectedUser) {
        var ap = attrsAccessibleForUser(connectedUser, 'view'), key, output = {};
        ap = ap || [];

        for (var i = 0; i < ap.length; ++i) {
            key = ap[i];
            output[key] = this[key];
        }
        return output;
    };

    /**
     * Expose this method as an instance method
     * @type {Function}
     */
    schema.methods.cloneAccessible = cloneAccessible;

    /**
     * Get the current model's attributes from the request, and assign only those that are accessible by the user
     * @param connectedUser - user requesting to change or create a resource
     * @param ctrl - controller from which the request was initiated
     * @param action - "view"|"add"|"update" (actually "add", "update)
     * @param done - callback function
     */
    var getAccessibleParamsFromRequest = function (connectedUser, ctrl, action, done) {

        if (_.isFunction(action)) {
            done = action;
            action = "add";
        }

        if (!action) action = "add";

        var ap = attrsAccessibleForUser(connectedUser, action),
            key,
            val;

        for (var i = 0; i < ap.length; ++i) {
            key = ap[i];
            val = ctrl.param(key);
            if (val || val === 0 || val === false) {
                this[key] = val;
            }
        }

        //if(done) done();
        if (done && _.isFunction(done)) {
            this.validate(done);
        }
    };


    /**
     * Expose this method as an instance method
     * @type {Function}
     */
    schema.methods.getAccessibleParamsFromRequest = getAccessibleParamsFromRequest;


    /**
     * Checks and removes if needed the attributes of an object after checking the user's permissions
     * @param documentToCheck
     * @param connectedUser
     * @returns (True|False)
     */
    var clearUnAuthorizedAttrs = function (connectedUser) {
        var ap = attrsAccessibleForUser(connectedUser);
        if (!ap) return false;
        for (var key in this) {
            if (this.hasOwnProperty(key) && ap.indexOf(key) === -1) {
                delete this[key];
            }
        }

        return true;
    };

    /**
     * Expose this method as an instance method
     * @type {Function}
     */
    schema.methods.clearUnAuthorizedAttrs = clearUnAuthorizedAttrs;


    /**
     * Get an array of accessible attributes by user for an action
     * @param connectedUser
     * @param action (view|add|update)
     * @returns {Array}
     */
    var attrsAccessibleForUser = function (connectedUser, action) {
        var attrsPermissions = schema.attrsPermissions,
            role = (connectedUser && connectedUser.role) ? connectedUser.role : 0,
            ap;

        if (!attrsPermissions) return [];
        if (!action) action = 'view';

        ap = attrsPermissions[action];

        //fallback in-case no params were found
        if (!ap) {
            if (action === 'update') {
                if (attrsPermissions['add']) ap = attrsPermissions['add'];
                else if (attrsPermissions['view']) ap = attrsPermissions['view'];
            }
        }

        if (!ap) {
            if (attrsPermissions[0] || attrsPermissions[1] || attrsPermissions[2] || attrsPermissions[3]) {
                ap = attrsPermissions;
            }
        }

        if (!ap) return [];

        return getAccessibleAttrsByRole(role, ap);
    };


    /**
     *  Expose this method as a static model method
     * @type {Function}
     */
    schema.statics.attrsAccessibleForUser = attrsAccessibleForUser;


    /**
     * Get the schema's accessible attributes by user's role, getting all attributes from the role and beneath
     * @param role - user's role (1-user,2-admin,3-superadmin)
     * @param ap - list of attribute permissions
     * @returns {Array}
     */
    var getAccessibleAttrsByRole = function (role, ap) {
        var output = [], current;

        while (role >= 0) {
            current = ap[role--];
            if (current && _.isArray(current)) output = output.concat(current);
        }

        return output;
    }
};