var Imager = require('imager'),
    gm = require('gm').subClass({imageMagick: true}),
    locomotive = require('locomotive'),
    knox = require('knox'),
    deepExtend = require('deep-extend'),
    https = require('https'),
    imagerConfig = locomotive.express.set('imagerConfig');


/**
 * Create a new Imager object based on config or
 * @param config -
 * {
 *  variants: {
     items: {
      resize: {
        mini : "300x200",
        preview: "800x600"
      },
      crop: {
        thumb: "200x200"
      }
     }
    },
    storage: {
       S3: {
        bucket: 'BUCKET_NAME',
        storageClass: 'REDUCED_REDUNDANCY'
    }
 * }
 * @returns {Imager}
 */
exports.create = function (config) {

    if (config) deepExtend(imagerConfig, config);

    return new Imager(imagerConfig, 'S3');
};

/**
 * Verify image size and fileSize
 * @param path - path to image to verify, works with client local path as well
 * @param config - {fileSize: number, size: {width, height}, minHeight, minWidth, verifySquareDimensions:boolean}
 * @param done  - ( err, result:true or null )
 */
exports.verifySize = function (path, config, done) {

    config = _.extend({
        minHeight : 0,
        minWidth : 0,
        maxHeight : 999999999,
        maxWidth : 999999999
    }, config);

    var noError = null;

    if (typeof done === 'undefined') {
        done = config;
        config = {};
    }

    config.fileSize = config.fileSize || 4 * 1028 * 1028;//4 mega max file size

    gm(path).identify(
        function identified(err, imageData) {
            if (err) return done(err);
            else {
                //imageData is a string of type 128x128
                if (imageData) {
                    if (config.minWidth || config.minHeight) {
                        var imageWidth = parseInt(imageData.size.width);
                        var imageHeight = parseInt(imageData.size.height);

                        if (!imageWidth || !imageHeight) return done('Invalid data');

                        if (imageWidth < config.minWidth || imageHeight < config.minWidth || imageWidth > config.maxWidth || imageHeight > config.maxHeight) {
                            return done('Image dimensions ' +  [imageWidth, imageHeight].join('x') + 'px are too small. Minimum image dimensions are ' +
                                [config.minWidth,config.minHeight].join('x') + 'px');
                        }
                    }

                    //verify image size ( example 128x128 )
                    if (config.size && imageData.size !== config.size) return done('Image size ' + imageData.size + ' is not valid should be ' + config.size);

                    //verify image dimensions are squared
                    if (config.verifySquareDimensions && imageData.size && imageData.size.width !== imageData.size.height) {
                        return done("Image doesn't have square dimensions");
                    }

                    //verify max file size
                    if (imageData.fileSize > config.fileSize) return done('File is too big. Should be less than ' + config.fileSize);

                    return done(noError, true);

                }
                else return done("Can't get file data");
            }
        });
};


// Amazon settings init
var amazonConfig = locomotive.express.set('amazonConfig');
var bucketName = 'appstrio_chrome_app_assets';
var knoxClient = knox.createClient({
    key: imagerConfig.storage.S3.key,
    secret: imagerConfig.storage.S3.secret,
    bucket: bucketName
});

/**
 * Got url of image and return url for same image host on our amazon bucket
 * @param url
 * @param done
 */
exports.urlUploader = function(url, done){
    https.globalAgent.maxSockets = 1000;
    https.get(url, function(res){
        var type = res.headers['content-type'];
        var headers = {
            'Content-Length': res.headers['content-length'],
            'Content-Type': res.headers['content-type'],
            'x-amz-acl': 'public-read'

        };
        var contentType = {
            'image/jpeg': '.jpg',
            'image/jpg': '.jpg',
            'image/png': '.png',
            'image/gif': '.gif',
            'image/webp': '.webp'
        };

        var time =  new Date().getTime();
        var imgName = "img"+time+contentType[type];
        knoxClient.putStream(res, '/'+imgName, headers, function(err, res){
            if(err){
                done(err);
            }else{
                var amazonUrl = 'https://s3.amazonaws.com/';
                done(null, amazonUrl+bucketName+"/"+imgName);
            }
        });
    }).on('error',function(err){
        console.log('err',err);
        done();
    })
};