var React = require('react');
var Router = require('react-router');
var Reflux = require('reflux');
Reflux.Promise = require('bluebird');
var clientRoutes = require('../../lib/client-routes');

module.exports = {
    renderApp: function(id,session) {
        var router = Router.create({
            routes: clientRoutes,
            location: Router.HistoryLocation
        });
        router.run(function(Handler,state) {
            // render the UI client side and re-hydrate the client with the session generated on the
            // server to allow re-use of the markup already generated on the server
            React.render(React.createElement(Handler,{session: session}),document.getElementById(id));
        });
    }
};
