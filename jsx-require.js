var jsx = require('./jsx-cache');

function register() {
	require.extensions['.jsx'] = function( module, filename ) {
        return module._compile( jsx.transform( filename ),filename );
	};
}

register();
