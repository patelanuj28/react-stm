var Reflux = require('reflux');
var PoolActions = require('../actions/pool-actions');
var StoreMixins = require('../store-mixins');
var stmApi = require('../stm-api');

module.exports = Reflux.createStore({
    mixins: [StoreMixins.SessionDataMixin('poolStore')],
    init: function() {
        this.listenTo(PoolActions.refreshPools,this.onRefreshPools);
        this.listenTo(PoolActions.updatePool,this.onUpdatePool);
    },
    createDefaultSession: function(session) {
        this.getData(session,(data) => {
            data.pools = null;
            data.pending = 0;
        });
    },
    initializeSession: function(routerState, session, done)
    {
        this.getData(session,(data) => {
            // pools are shown on both the pool and virtual server pages
            // so pre-populate in both cases
            if (routerState.pathname.indexOf('/pools')===0 || 
                routerState.pathname.indexOf('/virtualservers')===0) {
                stmApi.getPools(session.accessToken,(err,pools)=> {
                    data.pools = pools;
                    done();
                });
            } else {
                done();
            }
        });
    },
    onRefreshPools: function(session) {
        this.getData(session,(data) => {
            stmApi.getPools(session.accessToken,(err,pools)=> {
                if (err) {
                    return console.error('Unable to get pools: %s',err.toString());
                }
                if (!data.pending) {
                    data.pools = pools;
                    this.trigger({ 
                        type: 'refresh', 
                        pools: data.pools 
                    });
                }
            });
        });
    },
    onUpdatePool: function(session,name,change) {
        this.getData(session,(data) => {
            ++data.pending;
            stmApi.postVirtualServer(session.accessToken,name,change,(err,pool)=> {
                --data.pending;

                if (err) {
                    return console.error('Unable to update pool %s: %s',name,err.toString());
                }

                data.pools[name] = pool;
                this.trigger({ 
                    type: 'refresh', 
                    pools: data.pools 
                });
            });
        });
    },
    getPool: function(session,id) {
        return this.getData(session).pools[id];
    },
    getPools: function(session) {
        return this.getData(session).pools;
    }
});
