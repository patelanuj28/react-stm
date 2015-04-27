var React = require('react');
var Router = require('react-router');

var UserProfile = require('./user-profile');

// The main view for the application, including the header, main nav and a content area
module.exports = React.createClass({
    displayName: 'App',
    childContextTypes: {
        session: React.PropTypes.object
    },
    getChildContext: function() {
        // ensure that components down the hierachy have access to the
        // session data object
        return {
            session: this.props.session
        }
    },
    render: function() {
        return (
            <div className='wrapper'>
                <div className='header-wrapper'>
                    <div className='container'>
                        <div className='row'>
                            <div className='col-md-12 main-header'>
                                <div>
                                    <h1>
                                        <span id='logo'>Brocade</span>
                                        <small className='pull-left'>SteelApp Traffic Manager</small>
                                    </h1>
                                </div>
                                <UserProfile />
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-md-12 main-nav'>
                               <ul>
                                    <li><Router.Link to='vs'>Virtual servers</Router.Link></li>
                                    <li><Router.Link to='pools'>Pools</Router.Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='content-wrapper'>
                    <div className='container'>
                        <Router.RouteHandler />
                    </div>
                </div>
            </div>
        );
    }
});
