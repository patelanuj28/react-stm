module.exports = {
    isInt: function(val) {
        if (isNaN(val)) {
            return false;
        }
        var x = parseFloat(val);
        return (x | 0) === x;
    },
    parseInt: function(val) {
        return this.isInt(val) ? parseInt(val) : null;
    }
};
