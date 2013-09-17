module.exports = function () {
    var self = this;

    this.mongoose = require('mongoose');
    this.mongoose.connect(this.set('db-uri'));

    //handle mongoose connection lost if database disconnects
    this.mongoose.connection.on('error', function (err) {
        console.log('[Server Error] Error with MongooseDB  - ', err);
        self.mongoose.connection.close();
    });

    this.mongooseTypes = require("mongoose-types");
    this.mongooseTypes.loadTypes(this.mongoose);
};

