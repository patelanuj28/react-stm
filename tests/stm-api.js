var chai = require('chai');
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var expect = chai.expect;

var stmApi = require('../lib/stm-api');
var vsStore = require('../lib/stores/virtualserver-store');
var VSActions = require('../lib/actions/virtualserver-actions');

describe('STM API', function() {
    before(function() {
        // mock out the STM HTTP API to return default data
        sinon
            .stub(stmApi,'getVirtualServers')
            .callsArgWith(1,null,{
                'testVirtualServer': {},
                'anotherVirtualServer': {}
            });
    });

    after(function() {
        // unmock the STM API
        stmApi.getVirtualServers.restore();
    });

    it('Can refresh virtual servers',function(done) {
        // create a new session
        var session = {};
        vsStore.createDefaultSession(session);

        // listen for events coming from the virtual server store
        var unsubscribe = vsStore.listen(function(event) {
            // check that the event properties are what we expect
            expect(event).to.have.property('type','refresh');
            expect(event).to.have.property('virtualServers');

            // check that the mocked virtual servers were passed through
            var virtualServers = event.virtualServers;
            expect(virtualServers).to.have.property('testVirtualServer');
            expect(virtualServers).to.have.property('anotherVirtualServer');

            // check that the virtual servers are now cached on the store
            var virtualServers = vsStore.getVirtualServers(session);
            expect(virtualServers).to.have.property('testVirtualServer');
            expect(virtualServers).to.have.property('anotherVirtualServer');
            
            // tidy up and finish the test
            unsubscribe();
            done();
        });

        // before we call the refresh action, we expect that no cached
        // virtual servers should be present on the virtual server store
        expect(vsStore.getVirtualServers(session)).to.be.null;

        // invoke the action to refresh the store virtual servers
        VSActions.refreshVirtualServers(session);
    });

});
