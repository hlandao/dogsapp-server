var urlLib = require('url'),
    Iconv = require('iconv-lite'),
    common = require('./common'),
    http = require('follow-redirects').http,
    https = require('follow-redirects').https,
    cheerio = require('cheerio'),
    Word = require('../../models/a_server/word'),
    async = require('async'),
    blackListArr = require('../../../data/categories/words').blackList;


/**
 * get all accessible data from page meta tags
 * @param $ - cheerio char of the page data
 * @returns {{url: String, title: String, thumbnail: String, siteName: String, description: String, type: String, keywords: [String], lang: String}}
 */
var getMeta = function ($) {
    var thumbnail = null,url = null, title = null, siteName = null, keywords = null, description = null, type = null, link = null , lang = null;
    if (($('title').text())) {
        title = $('title').text();
    }
    $('link').each(function () {
        if ($(this).attr('rel') === 'image_src') {
            thumbnail = $(this).attr('content');
        }
    });
    $('meta').each(function () {
        switch ($(this).attr('itemprop')) {
            case "name":
                siteName = $(this).attr('content');
                break;
            case "image":
                thumbnail = $(this).attr('content');
                break;
        }
        switch ($(this).attr('name')) {
            case "application-name":
                siteName = $(this).attr('content');
                break;
            case "keywords":
                keywords = $(this).attr('content');
                if (keywords) {
                    keywords = keywords.toLowerCase();
                    keywords = keywords && keywords.split(/\,| /);
                    keywords = keywords.filter(Boolean);
                }
                break;
            case "description":
                description = $(this).attr('content');
                break;
            case "title":
                title = $(this).attr('content');
                break;
            case "Language":
                lang = $(this).attr('content');
                break;
        }
        switch ($(this).attr('property')) {
            case "og:url":
                url = $(this).attr('content');
                break;
            case "og:title":
                title = $(this).attr('content');
                break;
            case "og:type":
                type = $(this).attr('content');
                break;
            case "og:image":
                thumbnail = $(this).attr('content');
                break;
            case "og:site_name":
                siteName = $(this).attr('content');
                break;
            case "og:description":
                description = $(this).attr('content');
                break;
            case "twitter:title":
                title = $(this).attr('content');
                break;
            case "twitter:image":
                thumbnail = $(this).attr('content');
                break;
            case "twitter:description":
                description = $(this).attr('content');
                break;
            case "http://ogp.me/ns#title":
                title = $(this).attr('content');
                break;
            case "http://ogp.me/ns#site_name":
                siteName = $(this).attr('content');
                break;
            case "http://ogp.me/ns#description":
                description = $(this).attr('content');
                break;
            case "http://ogp.me/ns#image":
                thumbnail = $(this).attr('content');
                break;
        }
    });
    var item = {};
    if(title) item.title = title;
    if(thumbnail) item.thumbnail = thumbnail;
    if(siteName) item.siteName = siteName;
    if(description) item.description = description;
    if(type) item.type = type;
    if(keywords) item.keywords = keywords;
    if(lang) item.lang = lang;
    if(url) item.url = url;
    return item;
};

var getFavIcon = function($, url){
    var icon = '';
    $('link').each(function() {
        if($(this).attr('rel')){
            if(($(this).attr('rel').toLowerCase()=='apple-touch-icon')||
                ($(this).attr('rel').toLowerCase()=='shortcut icon')||
                ($(this).attr('rel').toLowerCase()=='icon')||
                ($(this).attr('rel').toLowerCase()=='shortcut icon apple-touch-icon'))
            {
                icon=$(this).attr('href');
            }
        }
    });
    if(icon){
        if(icon.indexOf('//')==0){
            icon=icon.replace('//','http://');
        } else if (icon.indexOf('/')==0) {
            var host = urlLib.parse(url).host;
            icon=host+icon;
        }
    } else {
        icon= urlLib.parse(url).host;
        if(icon[icon.length-1]!='/'){
            icon=icon+"/";
        }
        icon=icon+"favicon.ico";
    }
    if(icon.indexOf('http')!=0){
        icon="http://"+icon;
    }
    return icon;
};

/**
 * Get all site data from url
 * @param url - String
 * @param done
 */
var stripUrl = function (url, done) {
    getHtml(url, function (err, data) {
        $ = cheerio.load(data);
        var item = getMeta($);
        item.url = item.url || url;
        item.favIcon = getFavIcon($, item.url);
        if (item.title || item.description) {
            var pageText = '';
            if ((!item.description || item.description.length < 100) && (!item.keywords || item.keywords.length < 5)) {
                pageText = $('body').html();
                if (pageText) {
                    //remove scripts
                    pageText = pageText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                    //remove styles
                    pageText = pageText.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
                    //remove html tags
                    pageText = pageText.replace(/<(?:.|\n)*?>/gm, '');
                }
            }
            addCategoryFromText(item, pageText, function (err, arr) {
                item.keywords = arr[0];
                if(arr[1]) item.category = arr[1] || '';
                item.lang = arr[2];
                return done(null, item);
            });
        } else {
            return done(null, item);
        }
    });
};


var getHtml = function (feedUrl, done) {
    var feedUrl = urlLib.parse(feedUrl), body = '', path;
    path = feedUrl.path;
    if (path.indexOf('/') != 0) {
        path = '/' + path;
    }
    var config = {host: feedUrl.host, path: path, maxRedirects: 100,
        headers: {
            "Connection": "keep-alive"
        }
    };
    var protocol = http;
    if (feedUrl.protocol == "https:") {
        protocol = https;
    }
    protocol.globalAgent.maxSockets = 9999;

    var req = protocol.get(config, function (res) {
        res.on('data', function (data) {
            body += data;
        });
        res.on('end', function () {
            if (body && (body.indexOf('encoding="Windows-1255"') >= 0 || body.indexOf('encoding="windows-1255"') >= 0)) {
                getHttpUniqueEncoding(protocol, 'Windows-1255', config, done);
            } else if (body && (body.indexOf('charset=ISO-8859-1') >= 0 || body.indexOf('charset=iso-8859-1') >= 0 || body.indexOf('encoding="ISO-8859-1"') >= 0)) {
                getHttpUniqueEncoding(protocol, 'ISO-8859-1', config, done);
            } else if (body && (body.indexOf('charset=ISO-8859-2') >= 0 || body.indexOf('charset=iso-8859-2') >= 0 || body.indexOf('encoding="ISO-8859-2"') >= 0)) {
                getHttpUniqueEncoding(protocol, 'ISO-8859-2', config, done);
            } else if (body && (body.indexOf('charset=ISO-8859-9') >= 0 || body.indexOf('charset=iso-8859-9') >= 0)) {
                getHttpUniqueEncoding(protocol, 'ISO-8859-9', config, done);
            } else {
                done(null, body);
            }
        });
    });
    req.on('error', function (error) {
        // Error handling here
        req.abort();
    });

};

//get HTML unique encoding
var getHttpUniqueEncoding = function (protocol, encoding, config, done) {
    var body = '', responseBuffers = [], totallength = 0;
    var req = protocol.get(config, function (res) {
        res.on('data', function (data) {
            responseBuffers.push(data);
            totallength += data.length;
        });
        res.on('end', function () {
            var results = new Buffer(totallength);
            var pos = 0;
            for (var i = 0; i < responseBuffers.length; i++) {
                responseBuffers[i].copy(results, pos);
                pos += responseBuffers[i].length;
            }
            body = Iconv.decode(results, encoding);
            done(null, body);
        });
    });

    req.on('error', function (error) {
        // Error handling here
        req.abort();
    });
};


var addCategoryFromText = function (site, pageText, done) {
    var words = [], category = '', lang = '', keywords = [];
    if (site.keywords) {
        keywords = site.keywords;
        words = words.concat(site.keywords);
    }
    if (site.description) {
        words = words.concat(site.description.split(' '));
    }
    if (pageText) {
        words = words.concat(pageText.split(' '));
    }
    if (site.title) {
        words = words.concat(site.title.split(' '));
    }
    var wordCounts = {}, categoryCounts = {};

    for (var i = 0; i < words.length; ++i) {
        var word = words[i].toLowerCase().replace(/(\.|\,|\)|\(|\-|\!|\?|\n|\&)/, '');
        word = word.replace(/\n|\r|\t/g, '');
        if (word && !common.inSortedArray(blackListArr, word)) {
            wordCounts[word] = wordCounts[word] ? wordCounts[word] + 1 : 1;
        }
    }

    if (!site.keywords) {
        keywords = getTopWords(wordCounts, 15);
    }
    var keys = Object.keys(wordCounts);
    if (keys) {
        async.map(keys, function (word, cb) {
            Word.findOne({word: word}, function (err, wordItem) {
                if (wordItem && wordItem.category) {
                    cb(null, wordItem);
                } else {
                    cb(null);
                }
            });
        },function (err, results) {
            var theCategory = null, maxNum = 0;
            for (var i = 0; i < results.length; ++i) {
                if (results[i]) {
                    var category = results[i].category,
                        word = results[i].word;
                    categoryCounts[category] = categoryCounts[category] ? wordCounts[word] + categoryCounts[category] : wordCounts[word];
                    if (maxNum < categoryCounts[category]) {
                        maxNum = categoryCounts[category];
                        theCategory = results[i];
                    }
                }
            }
            if (theCategory) {
                category = theCategory.category;
                lang = theCategory.lang;
            }
            if (site.lang) lang = site.lang;
            done(null, [keywords, category, lang]);
        });
    }
};

var getTopWords = function (wordDic, num) {
    if (wordDic) {
        var items = [],
            sortable = [];
        for (var word in wordDic) {
            sortable.push([word, wordDic[word]]);
        }

        sortable.sort(function (a, b) {
            return b[1] - a[1]
        });
        sortable = sortable.splice(0, 15);
        for (var i = 0; i < sortable.length; ++i) {
            items.push(sortable[i][0]);
        }
        return items;

    } else {
        return null;
    }
};


exports.getHtml = getHtml;
exports.stripUrl = stripUrl;
exports.getHttpUniqueEncoding = getHttpUniqueEncoding;
