var fs = require('fs');

var bustersJson = null;

module.exports = {
    load: function(callback) {
        var self = this;
        // load the cache buster index built in production builds
        fs.readFile(__dirname+'/views/busters.json',{'encoding':'utf-8'},function(err,content) {
            if (err) {
                return callback(err,null);
            }
            bustersJson = JSON.parse(content);
            callback(
                null, 
                function(opts) {
                    // return a viewData mixin function which adds a buster function
                    // that can then be passed on to view templates to append cache buster
                    // hash values
                    opts.buster = function(url) {
                        if (!bustersJson) {
                            return url;
                        } else {
                            var hash = bustersJson['public'+url];
                            return url + (hash ? ('?' + hash.substr(0,10)) : '');
                        }
                    };
                    return opts;
                }
            );
        });
    }
};
