var fs = require( 'fs' );
var path = require( 'path' );
var ReactTools = require( 'react-tools' );

var keyRegex = new RegExp('[\\/]', 'g');
var cacheDir = __dirname + '/.jsx-cache';


if (process.env.NODE_ENV !== 'production') {
    try 
    {
        fs.mkdirSync(cacheDir);
    } catch (err)  {}
}

function getJSXTransformOptions(filename) {
    return {
       stripTypes: true,
       sourceFilename: filename.replace(__dirname,''),
       sourceMap: true,
       harmony: true
    };
}

function getCacheKey( filename ) {
    return filename.replace(keyRegex,'_');
}

function isCached( filename, cacheFile ) {
    try
    {
        var cachedStat = fs.statSync( cacheFile );
        var currentStat = fs.statSync( filename );
        return currentStat.mtime.getTime() < cachedStat.mtime.getTime();
    }
    catch (err) {
        return false;
    }
}

function cachePut( cacheFile, output ) {
    fs.writeFile(cacheFile+'.tmp',output,{ flag: 'wx' },function(err) {
        if (!err) {
            fs.rename(cacheFile+'.tmp',cacheFile,function(err) {
            });
        }
    });
}

function cacheGet( cacheFile ) {
    return fs.readFileSync( cacheFile, 'utf8' );
}

function transformContent(f) {
    var filename = typeof(f) === 'string' ? f : f.path; 
    var content;
    try 
    {
        if ( typeof(f) === 'string' ) {
            content = fs.readFileSync( filename, 'utf8' );
        } else {
            content  = f.contents.toString();
        }
        return ReactTools.transform( content, getJSXTransformOptions( filename ) );
    }
    catch (err) {
        console.error('Unable to compile file %s: %s',filename,err.toString());
        return content;
    }
}

module.exports = {
    transform: function( f ) {
        if (process.env.NODE_ENV === 'production') {
            return transformContent(f);
        }

        var filename = typeof(f) === 'string' ? f : f.path;

        var cacheFile = cacheDir + '/' + getCacheKey( filename );
        if ( isCached( filename, cacheFile ) ) {
            return cacheGet( cacheFile );
        } else {
            compiled = transformContent(f);
            cachePut( cacheFile, compiled );
            return compiled;
        }
    }
};

