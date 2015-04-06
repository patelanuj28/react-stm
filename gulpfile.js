var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    concat = require('gulp-concat'),
    mocha = require('gulp-spawn-mocha'),
	newer = require('gulp-newer'),
    gutil = require('gulp-util'),
    cssCacheBuster = require('gulp-css-cache-bust'), 
    cacheBuster = require('gulp-buster'), 
    webpack = require('webpack'),
    del = require('del'),
    fs = require('fs'),
    webpackDevServer = require('webpack-dev-server'),
	spawn = require('child_process').spawn;

var constants = require('./lib/constants');
var webpackConfig = process.env.NODE_ENV === 'production' ? require('./webpack.production') : require('./webpack.dev')(constants.APP_DOMAIN,constants.WEBPACK_PORT);

var node;
	
gulp.task('styles',['images'], function() {
    if (process.env.NODE_ENV === 'production') {
        return gulp.src('assets/css/app.css')
            .pipe(newer('public/assets/app.css'))
            .pipe(minifycss())
            .pipe(cssCacheBuster({
                base: __dirname + '/public'
            }))
            .pipe(gulp.dest('public/assets'));
    } else {
        return gulp.src('assets/css/*.css')
            .pipe(gulp.dest('public/assets'));
    }
});

gulp.task('vendor-styles', function() {
	return gulp.src([
		'node_modules/bootstrap/dist/css/bootstrap.css',
        'node_modules/font-awesome/css/font-awesome.css'
	])
    .pipe(newer('public/assets/vendor.css'))
	.pipe(concat('vendor.css'))
    .pipe(minifycss())
    .pipe(gulp.dest('public/assets'));
});

// generate content hashes for all the static assets so that unique
// cache buster keys can be added to those static assets in page templates 
gulp.task('cache-buster',['styles','vendor-styles','webpack'],function() {
   return gulp.src(['public/assets/**/*','public/img/**/*'])
    .pipe(cacheBuster())
    .pipe(gulp.dest('lib/views'))
});

gulp.task('webpack', function(callback) {
    webpack(webpackConfig, function(err,stats) {
        if (err) {
            callback(new gutil.PluginError("webpack",err));
            return;
        }
        gutil.log("[webpack]",stats.toString({ colors: true }));
        callback();
    });
});

// runs the webpack dev server and the express app behind a 
// proxy server
gulp.task('webpack-dev-server',['server'], function(callback) {
    var compiler = webpack(webpackConfig);
    var server = new webpackDevServer(compiler, {
        contentBase: { target: 'http://'+constants.APP_DOMAIN+':'+constants.APP_PORT },
        proxy: { '*': 'http://'+constants.APP_DOMAIN+':'+constants.APP_PORT },
        publicPath: '/assets/',
        hot:true,
        stats: { colors: true }
    });
    server.listen(constants.WEBPACK_PORT,'0.0.0.0',function() {
        callback();
    });
});

// optimize all static images
gulp.task('images', function() {
  	return gulp.src('assets/img/**/*')
	.pipe(newer('public/img'))
  	.pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
  	.pipe(gulp.dest('public/img'));
});

// copy across static font assets
gulp.task('fonts',function() {
    return gulp.src('node_modules/font-awesome/fonts/**/*')
    .pipe(newer('public/fonts'))
    .pipe(gulp.dest('public/fonts'));
});

gulp.task('tests', function() {
	return gulp.src(['tests/**/*'],{read:false})
	.pipe(mocha({
		bin:'node_modules/.bin/mocha',
    	R: 'spec',
        compilers: 'jsx:./jsx-require'
  	})).on('error', function(e) {
		console.warn(e.toString());
		this.emit('end');
	});
});

// run the server and listen for changes
gulp.task('server',function(callback) {
	if ( node ) {
		console.log('Restarting application server...');
		node.kill();
	} else {
		process.on('exit',function() {
			node.kill();
		});
	}
	node  = spawn('node',['index.js'],{stdio:'inherit'});
	node.on('close',function(code) {
		if ( code === 8 ) {
			console.log('Error detected, waiting for changes...');
		}
	});
    callback();
});

gulp.task('clean', function(cb) {
    del([
        'public/**'
    ],function() {
        fs.mkdir('public',cb);
    });
});

gulp.task('build-common',['styles','vendor-styles','images','fonts','cache-buster']);

// external tasks
gulp.task('build',['build-common','webpack']);
gulp.task('testsw',['tests'], function() {
	gulp.watch(['lib/**/*.js','lib/**/*.jsx','tests/**/*'],['tests']);
});
gulp.task('serverw', ['build-common','webpack-dev-server'],function() {
	gulp.watch('assets/css/**/*',['styles']);
	gulp.watch('assets/img/**/*',['images']);
	gulp.watch(['lib/**/*.jsx','lib/**/*.js'],['server']);
});
gulp.task('default',['serverw']);
