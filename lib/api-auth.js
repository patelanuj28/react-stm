var mongo = require('mongodb');

function failure(req,res) {
    res.send(401);
}

// middleware that converts a bearer token into basic auth credentials for
// the user who owns that token
module.exports = function(req,res,next) {
    if (!req.headers || !req.headers.authorization) {
        return failure(req,res);
    }

    var parts = req.headers.authorization.split(' ');
    if (parts.length!==2 || !/^Bearer$/i.test(parts[0])) {
        return failure(req,res);
    }

    var token = parts[1];
    var app = this;
    this.db.collection('users').findOne({ token: token },function(err,user) {
        if (err) {
            console.error('Failed to find user: %s',err.toString());
            failure(req,res); 
        } else if (!user) {
            console.error('No user exists with this token: %s',token);
            failure(req,res); 
        } else {
            req.headers.authorization = 'Basic '+new Buffer(user.username+':'+user.password).toString('base64');
            next();
        }
    });
}
