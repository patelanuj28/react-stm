var http = require('http');
var path = require('path');
var MongoClient = require('mongodb');
var Reflux = require('reflux');
Reflux.Promise = require('bluebird');

var express = require('express');
var sessions = require('client-sessions');
var compression = require('compression');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var errorHandler = require('errorhandler');
var ECT = require('ect');

var serverRoutes = require('./server-routes');
var constants = require('./constants');

var app = express();
app.set('port', constants.APP_PORT);

// setup view engine. Using the ECT view engine, though most of the view rendering
// is being done by React - so there are not many server side view templates in use
var ectRenderer = ECT({ watch: process.env.NODE_ENV !== 'production', root: __dirname + '/views', ext: '.ect' });
app.set('view engine', 'ect');
app.set('views', __dirname + '/views');
app.engine('ect',ectRenderer.render);

// use client sessions so server restarts don't cause users to
// get logged out
app.use(sessions({
    cookieName: 'ui_auth',
    secret:'somereallysecretprivatekey',
    duration: 365 * 24 * 60 * 60 * 1000,
    cookie: {
        path: '/',
        maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
        ephemeral: false,
        httpOnly: false,
        secure: false
    }
}));

// configure logging
var consoleStream = {
    write: function(message,encoding) {
        console.log(message); 
    }
};
app.use(morgan('combined',{stream:consoleStream}));

if (process.env.NODE_ENV==='production') {
    // app services for production
    console.log('Configuring application for production...');
    app.enable('trust proxy');
} else {
    // app services for development
    console.log('Configuring application for development...');
    app.use(errorHandler({dumpExceptions: true,showStack:true}));
}

// configure server middleware
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
//cache all the things! - use cache busting when assets have updated
app.use(express.static(path.join(__dirname, '../public'),
{ 
    maxAge: constants.RESOURCE_CACHE_TIME * 1000, 
    lastModified: false
}));

// connect to the database
MongoClient.connect('mongodb://localhost/ui-demo',function(err,db) {
    if (err) {
        return console.error('Failed to connect to MongoDB: %s',err.toString());
    }

    app.db = db;
    console.log('Connected to MongoDB');
    db.on('error',function(err){
        console.error('MongoDB: %s',err.toString());
    });
    db.on('close',function() {
        app.logger.warn('MongoDB: connection closed'); 
    });

    // configure server side routes and start up the server
    serverRoutes(app,function(err,app) {
        if (err) {
            return console.error('Failed to configure server routes: %s',err.toString());
        }

        console.log('Routes configured');
        app.listen(app.get('port'),function() {
            console.log('Express server listening on port %d',app.get('port'));
        });
    });
});

