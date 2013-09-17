module.exports = function () {

    if (this.set('enableLogger')) {
        this.logger.addConsole({ json: false, colorize: true });
        this.logger.addLoggly(this.set('loggly'));
    }
};

