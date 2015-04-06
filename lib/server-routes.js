var Router = require('react-router');
var React = require('react');
var httpProxy = require('http-proxy');
var request = require('superagent');
var constants = require('./constants');
var uuid = require('node-uuid');
var auth = require('./auth');
var apiAuth = require('./api-auth');
var buster = require('./buster');
var clientRoutes = require('./client-routes');
var sessions = require('./sessions');

module.exports = function(app,callback) {
    // Allow requests to self signed certificates
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    // load up the generated cache buster keys so
    // we can pass them through to the views
    buster.load(function(err,viewDataMixin) {
        if (err) {
            console.error('Failed to load cache-buster index, will not be able to add cache-busting hashes to resource URLs: %s',err.toString());
        }
       
        app.get('/auth/signin',function(req,res) {
            res.render('signin.ect',viewDataMixin({ username: '' }));
        });

        app.post('/auth/signin',function(req,res) {
            // log in to the STM instance
            var loginRequest = 
                request
                .post('https://'+constants.STM_HOST+':9090/apps/zxtm/login.cgi')
                .redirects(0)
                .type('form')
                .field('_form_submitted','form')
                .field('form_username',req.body.username)
                .field('form_password',req.body.password)
                .field('form_submit','Login')
                .end(function(err,response) {
                    var success = response.statusCode===302 && response.headers['set-cookie']!==null;
                    if (!success) {
                        // invalid user credentials... try again
                        res.render('signin.ect',viewDataMixin({ username: req.body.username }));
                    } else {
                        // successfully signed into STM! create a user token in our
                        // local DB so we can make proxied STM api requests using just
                        // the generated auth token. This will be translated back into
                        // http basic auth before proxying on to STM.
                        app.db.collection('users').findAndModify(
                            {username:req.body.username.toLowerCase(),password:req.body.password},
                            [['_id','asc']],
                            {
                                $setOnInsert: {
                                    username: req.body.username.toLowerCase(),
                                    password: req.body.password,
                                    token: uuid.v4()
                                }
                            },
                            {
                                new: true,
                                upsert: true
                            }
                        ,function(err,user) {
                            if (err) {
                                console.error('Unable to create user token: %s',err.toString());
                                res.render('signin.ect',viewDataMixin({ username: req.body.username }));
                                return;
                            }
                            user = user.value;
                            req.ui_auth.id = user._id.toString();
                            req.ui_auth.token = user.token;
                            
                            var redirect = req.query.redirect || '/';
                            if (redirect && (redirect.indexOf('/') !== 0 || redirect.indexOf('//') === 0)) {
                                console.error('Possible phishing attempt - attempt to redirect to %s on sign in',redirect);
                                redirect = '/';
                            }
                            res.redirect(redirect);
                        });   
                    }
                });
        });

        app.get('/auth/signout',function(req,res) {
            res.clearCookie('ui_auth');
            res.redirect('/');
        });

        // allow the UI to request some information about the currently signed in user
        app.get('/userprofile',auth.bind(app),function(req,res) {
            res.json({
                username: req.currentUser.username
            });
        });

        // proxy all STM api requests on after converting the auth token back
        // to HTTP Basic Auth. NOTE: secure: false allows accepting self signed
        // ssl certs when proxying the STM API
        var proxy = httpProxy.createProxyServer({ secure: false});
        proxy.on('error',function(err,req,res) {
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            res.end('Unable to proxy request to STM: '+err.toString());
        });
        app.all('/api*',apiAuth.bind(app),function(req,res) {
            proxy.web(req,res,{ target: 'https://'+constants.STM_HOST+':9070/' });
        });

        // all routing is handled via the react-router framework, so the server can just
        // serve the same index page to all urls that don't have a specific handler above
        app.get('/*',auth.bind(app),function(req,res,next) {
            // instansiate react-router. This is the same router than runs on the client
            // with a different handler for route aborts as redirects on the server have
            // to be handled differently than on the client
            var router = Router.create({
                routes: clientRoutes,
                location: req.url,
                onAbort: function(abortReason, location) {
                    if (abortReason.constructor.name === 'Redirect') {
                        // issue a server side redirect
                        return res.redirect(this.makePath(abortReason.to,abortReason.params,abortReason.query));
                    } else {
                        next(abortReason);
                    }
                }
            });
            // run the router server-side
            router.run(function(Handler,routerState) {            
                // initialize any relevant stores server side before doing server side rendering
                // as server side rendering is a synchronous operation and works best if all relevant
                // data is available beforehand
                sessions.initialize(routerState,{ accessToken: req.currentUser.token },function(err,session) { 
                    if (err) {
                        return next(err);
                    }

                    var content = React.renderToString(React.createElement(Handler,{ session: session }));
                    res.render('index.ect',viewDataMixin({content: content, session: session }));
                });
            });
        });

        callback(null,app);
    });
};
