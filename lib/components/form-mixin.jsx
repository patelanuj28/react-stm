function merge(obj,mixin) {
    for (var key in mixin) {
        if (mixin.hasOwnProperty(key)) {
            obj[key] = mixin[key]; 
        }
    }
    return obj;
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function deepEqual(a,b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

module.exports = {
    mixinFormState: function(state) {
        state.changes = {};
        state.errors = {};
        return state;
    },
    handleFormChange: function(field,converter,event) {
        if (!event) {
            event = converter;
            converter = null;
        }
        var changes = clone(this.state.changes);
        changes[field] = converter ? converter(event.target.value) : event.target.value;
        var errors = {};
        if (this.onFormValidate) {
            this.onFormValidate(changes,errors);
        }
        this.setState({ changes: changes, errors: errors });
    },
    getFormValue: function(field,converter) {
        var value = this.state.changes[field];
        if (typeof(value)==='undefined') {
            value = this.state.data[field];
        }
        return converter ? converter(value) : value;
    },
    hasFormError: function(field) {
        return typeof(this.state.errors[field]) !== 'undefined';
    },
    hasFormErrors: function() {
        return Object.keys(this.state.errors).length > 0;
    },
    cancelFormChanges: function() {
        this.setState({ 
            changes: {},
            errors: {},
            initialData: this.state.data
        });
    },
    applyFormChanges: function() {
        var data = merge(clone(this.state.data),this.state.changes);
        var errors = {};
        if (!this.onFormValidate || this.onFormValidate(this.state.changes)) {
            this.onApplyFormChanges(this.state.changes,errors);
            this.setState({ errors: errors });
        }
        this.setState({
            data: data,
            initialData: data,
            changes: {},
            errors: errors
        });
    },
    getConflicts: function() {
        // all fields where the initial data differs from the current data, and the user has
        // a pending change for that same field
        var conflicts = [];
        var changeKeys = Object.keys(this.state.changes);
        if (changeKeys.length && 
            !deepEqual(this.state.data,this.state.initialData)) {
            for (var key in this.state.data) {
                if (this.state.data.hasOwnProperty(key)) {
                    if (this.state.data[key] !== this.state.initialData[key] && 
                        typeof(this.state.changes[key]) !== 'undefined') {
                        conflicts.push(key);
                    }
                }
            }
        }

        return conflicts; 
    }
};
