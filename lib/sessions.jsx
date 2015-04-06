var Promise = require('bluebird');
var fs = require('fs');
var path = require('path');

var stores = [];

function initializeSession(state,session,callback) {
    var serializers = [];
    stores.map((store)=> {
        serializers.push(new Promise(function(accept,reject) {
            if (typeof(store.initializeSession)!=='function') {
                accept();
            } else {
                if (typeof(store.createDefaultSession)==='function') {
                    store.createDefaultSession(session);
                }
                store.initializeSession(state,session,(err)=> {
                    if (err) {
                        reject(err);
                    } else {
                        accept();
                    }
                });
            }
        }));
    });
    // initialize all server side sessions in parallel
    Promise.all(serializers).then(()=> {
        callback(null,session);
    }).catch((err) => {
        callback(err,null); 
    });
}

module.exports = {
    initialize: function(state, session, callback) {
        if (stores.length) {
            initializeSession(state, session, callback);
        } else {
            // lazily initialize the list of stores requiring initialization
            fs.readdir(path.join(__dirname,'stores'),function(err,list) {        
                if (err) {
                    return callback(err,null);
                }
                list.map((storeFile)=> {
                    stores.push(require(path.join(__dirname,'stores',storeFile)));
                });
                initializeSession(state, session, callback); 
            });
        }
    }
};
