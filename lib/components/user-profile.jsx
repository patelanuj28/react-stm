var React = require('react');
var request = require('superagent');

// displays the currently signed in user
module.exports = React.createClass({
    displayName: 'UserProfile',
    componentDidMount: function() {
        request
        .get('/userprofile')
        .accept('application/json')
        .end((err,res)=> {
            if (err || !res.body) {
                return console.error('Unable to get user profile info: %s',err ? err.toString() : ('Status code '+res.statusCode));
            }
            this.setState({
                username: res.body.username
            });
        });
    },
    getInitialState: function() {
        return { username: null };
    },
    render: function() {
        if (this.state.username) {
            return (<div className='userprofile'>
                <i className='hidden-xs fa fa-user pull-left'></i>
                <div className='pull-left'>
                    <span className='hidden-xs'>{this.state.username}</span>
                    <a href='/auth/signout'>Sign out</a>
                </div>
            </div>);
        } else {
            return (<span></span>);
        }
    }
});
