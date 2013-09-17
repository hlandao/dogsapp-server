var mailer = require('../sendgrid.js');
var template = require('../template.js');

module.exports = function (_config, done) {

    var config = _.extend({
        fromEmail: "team@appstr.io",
        fromName: "Team Appstr.io",
        subject: 'Cheers, your account at Appstr.io has been approved!'
    }, _config);

    config.toEmail = config.user.email;
    config.activationLink = config.user.activationLink;

    if (!config.activationLink) return done('No activation link');

    var helloText = "Hello" + ((config.user && config.user.firstName) ? config.user.firstName : "") + ",";

    var textGenerator = function () {
        var text = "";
        text += helloText + "\n\n" +
            "Your account at Appstr.io was approved!\n" +
            "Click on the following link in order to activate your account\n" +
            "and start using Appstr.io :\n" +
            config.activationLink + "\n\n\n" +
            "Cheers,\n" +
            "Team Appstr.io";

        return text;

    };

    // get HTML template async
    template('new_user', {helloText: helloText, activationLink: config.activationLink}, function (err, templates) {
        var html = templates.html,
            text = templates.text;

        mailer.send({
            from: config.fromEmail,
            fromname: config.fromName,
            to: config.toEmail,
            subject: config.subject,
            text: text,
            html: html
        }, done);
    });
};
