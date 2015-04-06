var mongo = require('mongodb');

function failure(req,res) {
    req.ui_auth.reset();
    res.redirect('/auth/signin?redirect='+req.url);
}

// middleware that loads up a user context given the requests auth cookie
module.exports = function(req,res,next) {
    if (!req.ui_auth.id) {
        return failure(req,res); 
    }

    var app = this;
    this.db.collection('users').findOne({ _id:mongo.ObjectID(req.ui_auth.id), token: req.ui_auth.token },function(err,user) {
        if (err) {
            console.error('Failed to find user: %s',err.toString());
            failure(req,res); 
        } else if (!user) {
            console.error('No user exists with this id: %s',req.ui_auth.id);
            failure(req,res); 
        } else {
            req.currentUser = user;
            next();
        }
    });
};
