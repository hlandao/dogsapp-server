module.exports = function () {
    this.set('loggerConfig', { format: this.logger.format.short, stream: this.logger.requestJsonStream });
    this.set('errorHandlerConfig', { showStack: true });

    this.set('realm', 'http://kidsaver.herokuapp.com');


    this.set('db-uri', ' mongodb://hlandao:hlbbxp12@ds045938.mongolab.com:45938/heroku_app18091722');
    this.set('view options', {
        pretty: true
    });

    //loggly settings
    this.set('loggly', {
        subdomain: 'appstrio',
        inputToken: '518968bb-2156-4ecb-a760-2230fbd98622',
        json: true,
        level: 'warn'
    });

    //redis settings - when empty use local     redis://redistogo:@:
    this.set('redis', {
        host: 'jack.redistogo.com',
        port: 9492,
        password: 'a486e0588dd2b81f1a17d62c27a4bed7'
    });


    // sendgrid settings
    this.set('sendgridConfig', {
        user: 'app9309224@heroku.com',
        key: '7pt9dgru'
    });
};