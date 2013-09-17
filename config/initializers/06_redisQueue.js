var resque = require('coffee-resque');

module.exports = function () {
    var redisClient = this.set('redisClient');
    this.resque = resque.connect({
        //host: redis.host,
        //port: redis.port,
        //password: redis.password
        redis : redisClient
    });

    this.resque.redis.on('error', function (err) {
        console.log('[Reddis Error] - ', err);
    });
};
