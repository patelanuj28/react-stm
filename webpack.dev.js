var webpack = require('webpack');

module.exports = function(domain,port) {
    return {
        devtool: 'inline-source-map',
        debug: true,
        entry: {
            app: [__dirname + '/assets/css/app.css','webpack-dev-server/client?http://'+domain+':'+port,'webpack/hot/dev-server',__dirname + '/assets/js/app.js'],
            vendor: ['react','reflux','superagent','bluebird','react-router']
        },
        output: {
            libraryTarget: 'var',
            library: ['ui','[name]'],
            path: __dirname + '/public/assets',
            publicPath: '/assets/',
            filename: "[name].js",
            devtoolModuleFilenameTemplate: '[resource-path]'
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoErrorsPlugin(),
            new webpack.optimize.CommonsChunkPlugin('vendor','vendor.js')
        ],
        resolve: {
            extensions: [ '','.js','.jsx']
        },
        module: {
            loaders: [
                { test: /\.jsx$/, loaders: ['react-hot','jsx?harmony&stripTypes'], exclude: /node_modules/ },
                { test: /\.css$/, loaders: ['style','css'] }

            ]
        }
    };
};
