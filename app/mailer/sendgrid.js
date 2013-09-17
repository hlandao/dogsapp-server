var sendgrid = require('sendgrid'),
    locomotive = require('locomotive');
    sendgridConfig = locomotive.set('sendgridConfig');
    mailer = new sendgrid(sendgridConfig.user, sendgridConfig.key);

module.exports = mailer;


