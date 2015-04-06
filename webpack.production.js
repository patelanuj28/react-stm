var webpack = require('webpack');

module.exports = {
    debug: false,
    entry: {
        app: __dirname + '/assets/js/app.js',
        vendor: ['react','reflux','superagent','bluebird','react-router']
    },
    output: {
        libraryTarget: 'var',
        library: ['ui','[name]'],
        path: __dirname + '/public/assets',
        publicPath: '/assets/',
        filename: "[name].js",
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({minimize: true}),
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.CommonsChunkPlugin('vendor','vendor.js')
    ],
    resolve: {
        extensions: [ '','.js','.jsx']
    },
    module: {
        loaders: [
            { test: /\.jsx$/, loaders: ['jsx?harmony&stripTypes'], exclude: /node_modules/ }
        ]
    }
};

