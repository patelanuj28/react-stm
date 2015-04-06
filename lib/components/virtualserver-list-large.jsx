var React = require('react');

// on a large screen, we use a list column on the left of the screen
// for viewing and selecting virtual servers
module.exports = React.createClass({
    displayName: 'VirtualServerListLarge',
    render: function() {
        return (<div className='hidden-xs hidden-sm vs-list col-md-3'>
           <ul>
               {Object.keys(this.props.virtualServers).map((name)=> {
                    var vs = this.props.virtualServers[name];
                    return (<li 
                        key={name} 
                        className={this.props.selected === name ? 'active' : ''}
                        onClick={this.handleSelectChange.bind(this,name)}>
                            <div>
                                <h4><i className={'fa fa-circle '+(vs.properties.basic.enabled ? 'enabled' : 'disabled')}></i> {name}</h4>
                                <p>{vs.properties.basic.protocol.toUpperCase()} ({vs.properties.basic.port})</p>
                            </div>
                    </li>);
               })}
           </ul>
        </div>);
    },
    handleSelectChange: function(selected) {
        this.props.onSelectChange(selected);
    }
});
