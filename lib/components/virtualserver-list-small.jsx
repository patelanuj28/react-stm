var React = require('react');

// on small screens we a combobox at the top of the screen to select
// virtual servers
module.exports = React.createClass({
    displayName: 'VirtualServerListSmall',
    render: function() {
        return (<div className='visible-xs visible-sm vs-small-list col-md-12'>
            <form>
                <div className='form-group'>
                    <select value={this.props.selected} onChange={this.handleSelectChange} className='form-control'>
                       {Object.keys(this.props.virtualServers).map((name)=> {
                            var vs = this.props.virtualServers[name];
                            return (<option key={name} value={name}>{name} - {vs.properties.basic.protocol.toUpperCase()} ({vs.properties.basic.port})</option>);
                       })}
                    </select>
                </div>
            </form>
        </div>);
    },
    handleSelectChange: function(evt) {
        this.props.onSelectChange(evt.target.value);
    }
});

