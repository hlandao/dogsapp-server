var geoip = require('geoip-lite');
/**
 * Get country from ip
 * @param ip
 * @returns {string} : country
 */
var getCountryFromIp = function (ip) {
    var country = '';
    var geo = geoip.lookup(ip);
    if (geo) country = geo.country;
    return country;
};

/**
 * Get country code and ip of the request
 * @param req -http request
 * @returns {ip:String, cc:String}
 */
var getIpCountryFromRequest = function (req) {
    var ip;
    try{
        ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    }catch(err){
        //todo log
    }

    return {
        ip: ip,
        cc: getCountryFromIp(ip)
    };
};



exports.getIpCountryFromRequest = getIpCountryFromRequest;