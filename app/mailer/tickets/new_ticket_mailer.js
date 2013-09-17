var mailer = require('../sendgrid.js');
var template = require('../template.js');

module.exports = function (_config, done) {

    var ticket = _config.ticket || {};

    var config = _.extend({
        fromEmail: "tickets@appstr.io",
        subject: 'New ticket created at Appstr.io'
    }, _config);

    config.toEmail = 'team@appstr.io';

    var helloText = "New ticket created at Appstr.io";

    var textGenerator = function () {
        var text = "";
        text += helloText + "\n\n" +
            "Subject:" + ticket.subject + "\n\n" +
            "Body:" + ticket.body + "\n\n" +
            "Email:" + ticket.email + "\n\n" +
            "UserId:" + ticket.user + "\n\n" +
            "Ip:" + ticket.ip + "\n\n" +
            "createAt:" + ticket.createdAt + "\n\n" +
            "Ticket Link:" + config.ticketLink + "\n\n";

        return text;
    };

    // get HTML template async
    template('new_user', {helloText: helloText}, function (err, templates) {
        var text = textGenerator();

        mailer.send({
            from: config.fromEmail,
            to: config.toEmail,
            subject: config.subject,
            text: text
        }, done);
    });
};
