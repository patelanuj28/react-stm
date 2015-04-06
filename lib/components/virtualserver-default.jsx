var React = require('react');
var Reflux = require('reflux');

var VSActions = require('../actions/virtualserver-actions');
var vsStore = require('../stores/virtualserver-store');

module.exports = React.createClass({
    displayName: 'VirtualServerDefault',
    mixins: [Reflux.ListenerMixin],
    contextTypes: {
        router: React.PropTypes.func,
        session: React.PropTypes.object
    },
    componentDidMount: function() {
        this.listenTo(vsStore,this.onStoreUpdate);
        this.makeDefaultSelection();
    },
    getInitialState: function() {
        return { 
            virtualServers: vsStore.getVirtualServers(this.context.session)
        };
    },
    makeDefaultSelection: function() {
        if (this.state.virtualServers) {
            var keys = Object.keys(this.state.virtualServers);
            if (keys.length) {
                this.context.router.transitionTo('vs-detail',{ name: keys[0] });
            }
        }
    },
    onStoreUpdate: function(event) {
        if (event.type === 'refresh') {
            this.setState(this.getInitialState());
            this.makeDefaultSelection();
        }
    },
    render: function() {
        if (this.state.virtualServers && !this.state.virtualServers.length) {
            // if no virtual servers have been created, show a default UI
            // instructing the users to create one
            // TODO actually create a decent looking view here
            return (<div>Create a virtual server!</div>);
        } else {
            return (<div></div>);
        }
    }
});
