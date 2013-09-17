module.exports = function routes() {
    /* Static Routes */
    this.root('home#index');

    this.match('login', 'users#login', { via: 'POST' });
    this.match('check_password', 'users#checkPassword', { via: 'POST' });

    this.match('login_blocked', 'users#loginBlocked', { via: 'POST' });
    this.match('logout', 'users#logout', { via: 'GET' });
    this.match('password/forgot', 'users#passwordForgot', { via: 'POST' });

    this.match('password/reset', 'users#passwordReset', { via: 'POST' });
    this.match('password/reset/:token', 'users#passwordResetForm', { via: 'GET' });
    this.match('resend_verification', 'users#resendVerificationMail', { via: 'POST'});

    this.match('images/upload', 'images#upload', {via: 'POST'});

    this.match('login_blocked', 'users#loginBlockedForm', { via: 'GET' }); //TODO should be moved to client

    this.match('activate/:token', 'users#activate', { via: 'GET' });  //TODO should be moved to client ???

    /* Api Routes */
    this.resources('users', { except: [ 'new', 'edit' ] }, function () {
    });


    this.get('*', 'home#index');
};


