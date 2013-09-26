var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

module.exports = {
    development: {
        db: 'mongodb://localhost/kid-saver-dev',
        root: rootPath,
        app: {
            name: 'KidSaver Dev'
        },
        facebook: {
            clientID: "588620564528492",
            clientSecret: "55da4a80c5f289a6e36f5de9651a9fe2",
            callbackURL: "http://localhost:3000/auth/facebook/callback"
        },
        google: {
            clientID: "APP_ID",
            clientSecret: "APP_SECRET",
            callbackURL: "http://localhost:3000/auth/google/callback"
        },
        jwtToken : {
            secret : '1234567',
            expiracy : 1000*3600
        }
    },
    test: {
        db: 'mongodb://localhost/kid-saver-dev',
        root: rootPath,
        app: {
            name: 'KidSaver - Test'
        },
        facebook: {
            clientID: "APP_ID",
            clientSecret: "APP_SECRET",
            callbackURL: "http://localhost:3000/auth/facebook/callback"
        },

        google: {
            clientID: "APP_ID",
            clientSecret: "APP_SECRET",
            callbackURL: "http://localhost:3000/auth/google/callback"
        },
        jwtToken : {
            secret : '1234567',
            expiracy : 1000*3600
        }
    },
    production: {
        db: 'mongodb://localhost/kid-saver',
        root: rootPath,
        app: {
            name: 'KidSaver'
        },
        facebook: {
            clientID: "APP_ID",
            clientSecret: "APP_SECRET",
            callbackURL: "http://localhost:3000/auth/facebook/callback"
        },

        google: {
            clientID: "APP_ID",
            clientSecret: "APP_SECRET",
            callbackURL: "http://localhost:3000/auth/google/callback"
        },
        jwtToken : {
            secret : '1234567',
            expiracy : 1000*3600
        }
    }
};