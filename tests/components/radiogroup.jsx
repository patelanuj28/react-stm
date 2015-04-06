var jsdom = require('../helpers/mocha-jsdom');
var chai = require('chai');
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var expect = chai.expect;

describe('RadioGroup Component', function() {
    jsdom();

    it('Should have input names set on all radio inputs',function() {
        var React = require('react/addons');
        var RadioGroup = require('../../lib/components/radiogroup');
        var TestUtils = React.addons.TestUtils;

        var radioGroup = TestUtils.renderIntoDocument(
            <RadioGroup value='yes' name='enabled'>
                <input type='radio' value='yes' /> Yes
                <input type='radio' value='no' /> No
            </RadioGroup>
        );

        var inputs = TestUtils.scryRenderedDOMComponentsWithTag(radioGroup,'input');

        expect(inputs).to.have.length(2); 
        expect(inputs[0].getDOMNode().getAttribute('name')).to.equal('enabled');
        expect(inputs[1].getDOMNode().getAttribute('name')).to.equal('enabled');
    });

    it('Setting value property selects a radio button',function() {
        var React = require('react/addons');
        var RadioGroup = require('../../lib/components/radiogroup');
        var TestUtils = React.addons.TestUtils;

        var radioGroup = TestUtils.renderIntoDocument(
            <RadioGroup value='yes' name='enabled'>
                <input type='radio' value='yes' /> Yes
                <input type='radio' value='no' /> No
            </RadioGroup>
        );

        var inputs = TestUtils.scryRenderedDOMComponentsWithTag(radioGroup,'input');

        expect(inputs).to.have.length(2); 
        expect(inputs[0].getDOMNode().checked).to.equal(true);
        expect(inputs[1].getDOMNode().checked).to.equal(false);
    });

    it('OnChange event fires with the selected value',function() {
        var React = require('react/addons');
        var RadioGroup = require('../../lib/components/radiogroup');
        var TestUtils = React.addons.TestUtils;

        var changeHandler = sinon.spy(function(evt) {
            expect(evt.target.value).to.equal('no');
        });

        var radioGroup = TestUtils.renderIntoDocument(
            <RadioGroup value='yes' name='enabled' 
                onChange={changeHandler}>
                <input type='radio' value='yes' /> Yes
                <input type='radio' value='no' /> No
            </RadioGroup>
        );

        var inputs = TestUtils.scryRenderedDOMComponentsWithTag(radioGroup,'input');
        TestUtils.Simulate.change(inputs[1].getDOMNode());
      
        expect(changeHandler).to.have.been.calledOnce;
    });
});
