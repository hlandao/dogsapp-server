var errors = require('../errors/'),
    HttpError = errors.httpError,
    HttpValidateError = errors.httpValidateError,
    check = require('validator').check,
    sanitize = require('validator').sanitize;


module.exports = function (__id) {
    /**
     * Middleware that fetches the requested resource by the 'id' param and store it in self.resource
     * @param next
     */

    return function (next) {
        var self = this;
        var id = this.id = __id || this.param('id');

        if (!id) return self.error(new HttpError(420));

        try {
            check(self.id, 'not a valid id').isHexadecimal().len(24, 24);
        } catch (err) {
            return self.error(new HttpError({message: err.message}));
        }

        this.model.findOne({_id: id}, function (err, resource) {
            if (err) {
                return self.error(new HttpError(421));
            }
            if (!resource) return self.error(new HttpError(422));
            self.resource = resource;
            next();
        });

    }
};