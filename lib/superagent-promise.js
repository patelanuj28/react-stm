var Promise = require('bluebird');
var superagent = require('superagent');

function PromiseRequest() {
    superagent.Request.apply(this,arguments);
}

PromiseRequest.prototype = Object.create(superagent.Request.prototype);

// A thin wrapper around superagent that causes request.end() to return a Promise object
PromiseRequest.prototype.end = function() {
    var end = superagent.Request.prototype.end;
    var self = this;
    return new Promise(function(accept,reject) {
        end.call(self,function(err,value) {
            if (err) {
                return reject(err);
            }
            accept(value);
        });
    });
};

var request = function(method,url) {
    return new PromiseRequest(method,url);
};

request.get = function(url) {
    return request('GET',url);
}

request.head = function(url) {
    return request('HEAD',url);
}

request.post = function(url) {
    return request('POST',url);
}

request.put = function(url) {
    return request('PUT',url);
}

request.patch = function(url) {
    return request('PATCH',url);
}

request.delete = function(url) {
    return request('DELETE',url);
}

module.exports = request;
