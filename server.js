//for new relic
//require('newrelic');

var locomotive = require('locomotive'),
    env = process.env.NODE_ENV || 'development',
    port = process.env.PORT || 3000,
    address = '0.0.0.0';


locomotive.boot(__dirname, env, function (err, server) {
    if (err) {
        throw err;
    }
    server.listen(port, address, function () {
        var addr = this.address();

        console.log('listening on %s:%d', addr.address, addr.port);
    });
});

//catch uncought errors
process.on('uncaughtException', function (err) {
    locomotive.logger.error('server uncaughtException:', err.message, process.uptime());
    console.error((new Date()).toUTCString() + ' uncaughtException:', err.message);
    console.error(err.stack);

    console.log('\n\n\n\n' + process.uptime() + 'uptime\n\n\n\n');

    if (process.uptime() > 1000) {
        console.log('restart');
        //toobusy.shutdown();
        process.exit(1);
    }
});


var cronJob = require('cron').CronJob;
var util = require('util');


//to avoid memory leaks kill dyno once in 2 hours
var refreshProcess = new cronJob('00 01 */2 * * 1-7', function () {
        var randTime = Math.random() * 120000;
        setTimeout(function () {
            //close proccess for refresh
            locomotive.logger.warn('2 hours refresh ', {pid: process.pid, uptime: process.uptime(), memory: util.inspect(process.memoryUsage())});
            process.exit(1);
        }, randTime);
    }, function () {
        // This function is executed when the job stops
    },
    true /* Start the job right now */
);


