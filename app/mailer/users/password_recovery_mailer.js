var mailer = require('../sendgrid.js');
var template = require('../template.js');


module.exports = function (_config, done){

    var config = _.extend({
        fromEmail : "team@appstr.io",
        fromName  : "Team Appstr.io",
        subject : 'Recover your Appstr.io Password!'
    },_config);

    config.toEmail = config.user.email;
    config.newPasswordLink = config.user.newPasswordLink;

    if(!config.newPasswordLink) return done(new Error('No new password link'));

    var helloText = "Hello" + ((config.user && config.user.firstName) ? config.user.firstName : "") + ",";

    // get HTML template async
    template('password_recovery',{helloText : helloText, newPasswordLink : config.newPasswordLink}, function(err, templates){
        var html = templates.html,
            text = templates.text;

        var mailObject = {
            from         : config.fromEmail,
            fromname     : config.fromName,
            to           : config.toEmail,
            subject      : config.subject,
            text         : text,
            html         : html
        };

        console.log(mailObject);
        mailer.send(mailObject, done );
    });
};
