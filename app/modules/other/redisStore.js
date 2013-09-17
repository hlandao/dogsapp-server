module.exports = function (redis) {
    var redisClient = redis.createClient(redis.port, redis.host);
    redisClient.auth(redis.password, function (err) {
        if (err)  throw err;

    });

    redisClient.once('ready', function () {
        //logger.info('Redis client ready');
    });

    return new RedisStore({ client: redisClient });

};
