var React = require('react');
var Reflux = require('reflux');

var RadioGroup = require('./radiogroup');
var VSActions = require('../actions/virtualserver-actions');
var FormMixin = require('./form-mixin');

var vsStore = require('../stores/virtualserver-store');
var poolStore = require('../stores/pool-store');
var validation = require('../validation-helper');

module.exports = React.createClass({
    displayName: 'VirtualServerDetail',
    mixins: [Reflux.ListenerMixin,FormMixin],
    contextTypes: {
        router: React.PropTypes.func,
        session: React.PropTypes.object
    },
    componentDidMount: function() {
        this.listenTo(vsStore,this.onVSStoreUpdate);
        this.listenTo(poolStore,this.onPoolStoreUpdate);
    },
    getData: function() {
        var data = vsStore.getVirtualServer(
            this.context.session,
            this.context.router.getCurrentParams().name
        );
        return data ? data.properties.basic : data;
    },
    getStateForRoute: function() {
        var data = this.getData();
        return this.mixinFormState({
            name: this.context.router.getCurrentParams().name,
            data: data,
            initialData: data,
            pools: poolStore.getPools(this.context.session),
        });
    },
    getInitialState: function() {
        return this.getStateForRoute();
    },
    componentWillReceiveProps: function() {
        // if we're rendering for a different vs at a different route, we need
        // to update the component state with the new vs data
        if (this.context.router.getCurrentParams().name !== this.state.name) {
            this.setState(this.getStateForRoute());
        }
    },
    onVSStoreUpdate: function(event) {
        if (event.type === 'refresh') {
            this.setState({ data: this.getData() });
        }
    },
    onPoolStoreUpdate: function(event) {
        if (event.type === 'refresh') {
            this.setState({ pools: event.pools });
        }
    },
    onApplyFormChanges: function(changes) {
        VSActions.updateVirtualServer(
            this.context.session,
            this.state.name,
            {
                properties: {
                    basic: changes
                }
            });
    },
    onFormValidate: function(changes,errors) {
        var port = validation.parseInt(changes.port);
        if (port===null || port <= 0 || port >= 65535) {
           errors.port = 'Port must be an integer between 1 and 65535'; 
        }
    },
    render: function() {
        var conflicts = this.getConflicts();
        var conflictWarning = conflicts.length ? (
            <div className='alert alert-danger'>
                <i className='fa fa-warning text-danger'></i> This information has been changed elsewhere, clicking Apply may overwrite those changes {conflicts.join(', ')}
            </div>) : null;

        return (<div>
            <h2>{this.state.name} <small>({this.state.data.protocol.toUpperCase()}, port {this.state.data.port})</small></h2>
            <hr/>
            {conflictWarning}
            <form className='form-horizontal'>
                <div className='form-group'>
                    <label className='col-sm-2 control-label'>Enabled</label>
                    <RadioGroup className='col-sm-10' name='enabled' 
                            onChange={this.handleFormChange.bind(this,'enabled',(value)=> { return value === 'yes'; })} 
                            value={this.getFormValue('enabled',(value)=> { return value ? 'yes' : 'no'; })}>
                        <label className='radio-inline'>
                            <input type='radio' value='yes' name='enabled' /> Yes
                        </label>
                        <label className='radio-inline'>
                            <input type='radio' value='no' name='enabled' /> No  
                        </label>
                    </RadioGroup>
                </div>
                <div className='form-group'>
                    <label className='col-sm-2 control-label'>Internal protocol</label>
                    <div className='col-sm-2'>
                        <select className='form-control' value={this.getFormValue('protocol')} 
                                onChange={this.handleFormChange.bind(this,'protocol')}>
                            <option value='http'>HTTP</option>
                            <option value='https'>HTTPS</option>
                            <option value='udp'>UDP</option>
                        </select>
                    </div>
                </div>
                <div className={'form-group '+(this.hasFormError('port')?'has-error':'')}>
                    <label className='col-sm-2 control-label'>Port</label>
                    <div className='col-sm-2'>
                        <input className='form-control' onChange={this.handleFormChange.bind(this,'port')} 
                            value={this.getFormValue('port')} />
                    </div>
                </div>
                <div className='form-group'>
                    <label className='col-sm-2 control-label'>Pool</label>
                    <div className='col-sm-5'>
                        <select className='form-control' onChange={this.handleFormChange.bind(this,'pool')} value={this.state.data.pool}>
                            {this.state.pools ? Object.keys(this.state.pools).map((name)=> {
                                return (<option key={name} value={name}>{name}</option>);
                            }) : null}
                        </select>
                    </div>
                </div>
                <div className='form-group'>
                    <label className='col-sm-2 control-label'>Notes</label>
                    <div className='col-sm-5'>
                        <textarea className='form-control' onChange={this.handleFormChange.bind(this,'note')} 
                            value={this.getFormValue('note')} />
                    </div>
                </div>
                <div className='form-group'>
                    <div className='col-sm-offset-2'>
                        <input type='button' className='btn btn-primary' disabled={this.hasFormErrors()} onClick={this.applyFormChanges} value='Apply' />
                        <input type='button' className='btn' onClick={this.cancelFormChanges} value='Cancel' />
                    </div>
                </div>
            </form>
        </div>);
    }
});
