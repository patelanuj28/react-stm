var Router = require('react-router');
var React = require('react');

var VirtualServers = require('./components/virtualservers');
var VirtualServerDetail = require('./components/virtualserver-detail');
var VirtualServerDefault = require('./components/virtualserver-default');
var Pools = require('./components/pools');
var App = require('./components/app');
var NotFound = require('./components/notfound');

// represents the overall structure of the application and mappings from urls to react view components
module.exports = (
    <Router.Route name='app' path='/' handler={App}>
        <Router.Redirect from='/' to='vs' />
        <Router.Route name='vs' path='/virtualservers' handler={VirtualServers} >
            <Router.Route name='vs-detail' path='/virtualservers/:name' handler={VirtualServerDetail} />
            <Router.Route name='vs-default' path='/virtualservers*' handler={VirtualServerDefault} />
        </Router.Route>
        <Router.Route name='pools' path='/pools' handler={Pools} />
        <Router.NotFoundRoute handler={NotFound} />
    </Router.Route> );
