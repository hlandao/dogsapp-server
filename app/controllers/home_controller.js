var locomotive = require('locomotive');
var Controller = locomotive.Controller;

var HomeController = new Controller();

HomeController.index = function () {

    var user = this.req.user;
    if (this.req.isAuthenticated()) {
        this.u = user.publicDetails;
    } else {
        this.u = null;
    }

    this.realm = locomotive.set('realm');

    this.render('index');
};


module.exports = HomeController;