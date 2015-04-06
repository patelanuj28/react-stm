module.exports = {
    // helper for making it easier to get thier 
    // storage bucket from the session object
    SessionDataMixin: function(key) {
        return {
           getData: function(session,callback) {
                var data = session[key];
                if (!data) {
                    data = {}
                    session[key] = data;
                }
                if (callback) {
                    callback(data); 
                } else {
                    return data;
                }
           }
        };
    }
};
