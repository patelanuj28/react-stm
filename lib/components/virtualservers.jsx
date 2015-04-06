var React = require('react');
var Router = require('react-router');
var Reflux = require('reflux');

var constants = require('../constants');
var vsStore = require('../stores/virtualserver-store');
var poolStore = require('../stores/pool-store');

var SmallList = require('./virtualserver-list-small');
var LargeList = require('./virtualserver-list-large');
var VSActions = require('../actions/virtualserver-actions');
var PoolActions = require('../actions/pool-actions');

module.exports = React.createClass({
    displayName: 'VirtualServers',
    contextTypes: {
        router: React.PropTypes.func,
        session: React.PropTypes.object
    },
    componentDidMount: function() {
        this.unsubscribe = vsStore.listen(this.onStoreUpdate);
        VSActions.refreshVirtualServers(this.context.session);
        PoolActions.refreshPools(this.context.session);
        this.refresh = setInterval(()=> {
            VSActions.refreshVirtualServers(this.context.session);
            PoolActions.refreshPools(this.context.session);
        },constants.POLL_INTERVAL);
    },
    componentWillUnmount: function() {
        this.unsubscribe();
        clearInterval(this.refresh);
    },
    getStateFromRoute: function() {
        return {
            selected: this.context.router.getCurrentParams().name,
            virtualServers: vsStore.getVirtualServers(this.context.session)
        };
    },
    getInitialState: function() {
        return this.getStateFromRoute();
    },
    componentWillReceiveProps: function() {
        this.setState(this.getStateFromRoute());
    },
    onStoreUpdate: function(event) {
        if (event.type === 'refresh') {
            this.setState({
                virtualServers: event.virtualServers
            });
        }
    },
    handleSelectChange: function(selected) {
        if (selected !== this.state.selected) {
            this.context.router.transitionTo('vs-detail',{name: selected});
        }
    },
    render: function() {
        if (!this.state.virtualServers) {
            return (<Router.RouteHandler />);
        } else {
            return (<div className='vs-wrapper row'>
                <SmallList 
                    selected={this.state.selected} 
                    virtualServers={this.state.virtualServers} 
                    onSelectChange={this.handleSelectChange} /> 

                <LargeList 
                    selected={this.state.selected} 
                    virtualServers={this.state.virtualServers} 
                    onSelectChange={this.handleSelectChange} /> 

                <div className='vs-detail col-md-9'>
                    <Router.RouteHandler />
                </div>
            </div>);
        }
    }
});
