var fs = require('fs');
var path = require('path');

var bustersJson = null;

function buster(opts) {
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

module.exports = {
    load: function(callback) {
        var self = this;
        // load the cache buster index built in production builds
        fs.readFile(path.join(__dirname,'views','busters.json'),{'encoding':'utf-8'},function(err,content) {
            if (err) {
                return callback(err,buster);
            }
            bustersJson = JSON.parse(content);
            callback(
                null, 
                buster
            );
        });
    }
};
