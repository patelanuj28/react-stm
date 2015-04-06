var Reflux = require('reflux');
var VSActions = require('../actions/virtualserver-actions');
var StoreMixins = require('../store-mixins');
var stmApi = require('../stm-api');

module.exports = Reflux.createStore({
    mixins: [StoreMixins.SessionDataMixin('vsStore')],
    init: function() {
        this.listenTo(VSActions.refreshVirtualServers,this.onRefreshVirtualServers);
        this.listenTo(VSActions.updateVirtualServer,this.onUpdateVirtualServer);
    },
    createDefaultSession: function(session) {
        this.getData(session,(data) => {
            data.virtualServers = null;
            data.pending = 0;
        });
    },
    initializeSession: function(routerState, session, done)
    {
        this.getData(session,(data)=> {
            if (routerState.pathname.indexOf('/virtualservers')===0) {
                stmApi.getVirtualServers(session.accessToken,(err,virtualServers)=> {
                    data.virtualServers = virtualServers;
                    done();
                });
            } else {
                done();
            }
        });
    },
    onRefreshVirtualServers: function(session) {
        this.getData(session,(data)=>{
            stmApi.getVirtualServers(session.accessToken,(err,virtualServers)=> {
                if (err) {
                    return console.error('Unable to get virtual servers: %s',err.toString());
                }

                if (!data.pending) {
                    data.virtualServers = virtualServers;
                    this.trigger({ 
                        type: 'refresh', 
                        virtualServers: data.virtualServers 
                    });
                }
            });
        });
    },
    onUpdateVirtualServer: function(session,name,change) {
        this.getData(session,(data)=>{
            ++data.pending;
            stmApi.postVirtualServer(session.accessToken,name,change,(err,virtualServer)=> {
                --data.pending;

                if (err) {
                    return console.error('Unable to get update virtual server %s: %s',name,err.toString());
                }

                data.virtualServers[name] = virtualServer;
                this.trigger({ 
                    type: 'refresh', 
                    virtualServers: data.virtualServers 
                });
            });
        });
    },
    getVirtualServer: function(session,id) {
        return this.getData(session).virtualServers[id];
    },
    getVirtualServers: function(session) {
        return this.getData(session).virtualServers;
    }
});
