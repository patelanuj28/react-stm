var Promise = require('bluebird');
var request = require('./superagent-promise');
var constants = require('./constants');



// makes http requests to the STM REST API
module.exports = {
    getVirtualServers: function(accessToken,callback) {
        request
        .get(getBaseUrl() + '/config/active/virtual_servers')
        .set('Authorization','Bearer '+accessToken)
        .end()
        .then((response)=> {
            var details = [];
            response.body.children.map((child)=> {
                details.push(child.name);
                details.push(
                    request
                    .get(getBaseUrl() + '/config/active/virtual_servers/'+child.name)
                    .set('Authorization','Bearer '+accessToken)
                    .end());
            });
            // fetch the details for all the virtual servers in parallel
            return Promise.all(details);
        })
        .then((responses)=> {
            var virtualServers = {};
            var i = 0;
            while (i < responses.length) {
                virtualServers[responses[i++]] = responses[i++].body;
            }
            callback(null,virtualServers);
        }).catch((err)=> {
            callback(err,null);
        });
    },
    postVirtualServer: function(accessToken,name,change,callback) {
        request
        .put(getBaseUrl() + '/config/active/virtual_servers/'+name)
        .set('Authorization','Bearer '+accessToken)
        .send(change)
        .end()
        .then((response)=> {
            callback(null,response.body);
        }).catch((err)=> {
            callback(err,null);
        });
    },
    getPools: function(accessToken,callback) {
        request
        .get(getBaseUrl() + '/config/active/pools')
        .set('Authorization','Bearer '+accessToken)
        .end()
        .then((response)=> {
            var details = [];
            response.body.children.map((child)=> {
                details.push(child.name);
                details.push(
                    request
                    .get(getBaseUrl() + '/config/active/pools/'+child.name)
                    .set('Authorization','Bearer '+accessToken)
                    .end());
            });
            // fetch the details for all the pools in parallel
            return Promise.all(details);
        })
        .then((responses)=> {
            var pools = {};
            var i = 0;
            while (i < responses.length) {
                pools[responses[i++]] = responses[i++].body;
            }
            callback(null,pools);
        }).catch((err)=> {
            callback(err,null);
        });
    },
    postPool: function(accessToken,name,change,callback) {
        request
        .put(getBaseUrl() + '/config/active/pools/'+name)
        .set('Authorization','Bearer '+accessToken)
        .send(change)
        .end()
        .then((response)=> {
            callback(null,response.body);
        }).catch((err)=> {
            callback(err,null);
        });
    }
};

function getBaseUrl() {
    // when running in the browser we can make XHR requests to relative
    // urls, however when running on the server we need an absolute url
    var apiBase = typeof(window)!=='undefined' ? '' : ('http://localhost:'+constants.APP_PORT);
    return apiBase + '/api/tm/3.4';
}
