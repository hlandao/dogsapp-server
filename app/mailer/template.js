var jade = require('jade'),
    fs = require('fs');

module.exports = function(templateName, params, done){
    var templates = {};
    // Get the HTML template
    fs.readFile(__dirname + '/templates/' + templateName + '_html.jade', 'utf8', function (err, data) {
        if(!err){
            var fn = jade.compile(data);
            templates.html = fn(params);
        }
        // Then get the TEXT template
        fs.readFile(__dirname + '/templates/' + templateName + '_text.jade', 'utf8', function (err, data) {
            if(!err){
                var fn = jade.compile(data);
                templates.text = fn(params);
            }
            // now return everything to done
            done(null,templates);
        });
    });
};

