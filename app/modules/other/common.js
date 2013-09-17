module.exports = {

    /**
     * Remove trailing slash from url
     * turn "http://www.example.com/"  ---> "http://www.example.com"
     * @param url
     * @returns {*}
     */
    removeTrailingSlashesFromUrl : function(url){
        if (!url || typeof url !== 'string') return null;
        if (url.slice(-1) === '/') {
            return url.substr(0, url.length - 1);
        }
        return url;
    },



    /**
     * Remove http or https prefix from a url string
     * @param url
     * @returns {*}
     */
    removeHTTP : function(url){
        if(!url) return null;

        if (url.indexOf('https://')){
            return url.slice(7);
        }else if (url.indexOf('http://')){
            return url.slice(6);
        }
        return url;

    },

    /**
     * Find if String in sorted Array
     * @param arr [String]
     * @param word String
     * @returns {boolean}
     */
    inSortedArray : function (arr, word) {
        if (typeof(arr) === 'undefined' || !arr.length) return false;

        var high = arr.length - 1;
        var low = 0;

        while (low <= high) {
            var mid = parseInt((low + high) / 2);
            var element = arr[mid];
            if (element > word) {
                high = mid - 1;
            } else if (element < word) {
                low = mid + 1;
            } else {
                return true;
            }
        }
        return false;
    }


};