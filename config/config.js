var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

module.exports = {
    development: {
        db: 'mongodb://localhost/dogsapp-dev',
        root: rootPath,
        app: {
            name: 'DogsApp'
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
        },
        S3 : {
            key: 'AKIAJDXTJOOO2O5GAHHA',
            secret: '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',
            bucket: 'dogsapp'
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
            expiracy : 1000*3600*100
        }
    },
    production: {
        db: 'mongodb://hlandao:hlbbxp12@ds049558.mongolab.com:49558/heroku_app18487179',
        root: rootPath,
        app: {
            name: 'DogsApp'
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
            expiracy : 1000*3600*100
        },
        S3 : {
            key: 'AKIAJDXTJOOO2O5GAHHA',
            secret: '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',
            bucket: 'dogsapp'
        },
        allowedDomains : ['http://localhost:8000']
    }
};