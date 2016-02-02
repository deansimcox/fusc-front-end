import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import ftp from 'vinyl-ftp';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

const FAVICON_DATA_FILE = 'faviconData.json';
const fs = require('fs');


/*
	These are third party dependencies from bower tp be copied or concatenated. Generally you would want to concat any js and css dependencies.
 */
const dependencies = {
	concat: {
		js: [
			'bower_components/jquery/dist/jquery.js',
			'bower_components/bxslider-4/dist/jquery.bxslider.js',
			'bower_components/gsap/src/uncompressed/TweenMax.js',
			'bower_components/enquire/dist/enquire.js',
			'bower_components/vex/js/vex.js',
			'bower_components/vex/js/vex.dialog.js'
		],
		css: [
			'bower_components/font-awesome/css/font-awesome.css'
		]
	},
	copy: {
		js: [
			'bower_components/modernizr/modernizr.js'
		],
		fonts: [
			'bower_components/font-awesome/fonts/*'
		]
	}
};


/*
	List of browsers. Used by autoprefixer and autopolyfiller for determnining desired level of support
 */
const browsers = ['> 1%', 'last 10 versions', 'Chrome > 0', 'Firefox > 0', 'Explorer > 0', 'Opera > 0', 'Safari > 0'];

gulp.task('styles', () => {
	return gulp.src('app/styles/*.scss')
		.pipe($.plumber())
		.pipe($.sourcemaps.init())
		.pipe($.sass.sync({
			outputStyle: 'expanded',
			precision: 10,
			includePaths: ['.']
		}).on('error', $.sass.logError))
		.pipe($.autoprefixer({browsers: browsers}))
		.pipe($.sourcemaps.write())
		.pipe(gulp.dest('.tmp/styles'))
		.pipe(reload({stream: true}));
});

function lint(files, options) {
	return () => {
		return gulp.src(files)
			.pipe(reload({stream: true, once: true}))
			.pipe($.eslint(options))
			.pipe($.eslint.format())
			.pipe($.if(!browserSync.active, $.eslint.failAfterError()));
	};
}
const testLintOptions = {
	env: {
		mocha: true
	}
};

gulp.task('lint', lint(['app/scripts/**/*.js', '!app/scripts/polyfills-generated.js']));
gulp.task('lint:test', lint('test/spec/**/*.js', testLintOptions));

gulp.task('jade', function() {
	gulp.src('app/jade/pages/*.jade')
		.pipe($.jade({
			pretty: true
		}))
		.pipe(gulp.dest('.tmp'))
});

gulp.task('html', ['jade', 'styles'], () => {
	const assets = $.useref.assets({searchPath: ['.tmp', 'app', '.']});

	return gulp.src('.tmp/*.html')
		.pipe(assets)
		// .pipe($.if('*.js', $.uglify()))
		// .pipe($.if('*.css', $.minifyCss({compatibility: '*'})))
		.pipe(assets.restore())
		.pipe($.useref())
		.pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
		.pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
	return gulp.src('app/images/**/*')
		.pipe($.if($.if.isFile, $.cache($.imagemin({
			progressive: true,
			interlaced: true,
			// don't remove IDs from SVGs, they are often used
			// as hooks for embedding and styling
			svgoPlugins: [{cleanupIDs: false}]
		}))
		.on('error', function (err) {
			console.log(err);
			this.end();
		})))
		.pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
	return gulp.src(require('main-bower-files')({
		filter: '**/*.{eot,svg,ttf,woff,woff2}'
	}).concat('app/fonts/**/*'))
		.pipe(gulp.dest('.tmp/fonts'))
		.pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', () => {
	return gulp.src([
		'app/*.*',
		'!app/*.html'
	], {
		dot: true
	}).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('concat:serve', ['serve-pre'], () => {
	// concat thrid party javscript dependencies
	gulp.src(dependencies.concat.js)
		.pipe($.concat('vendor-concat.js'))
		.pipe(gulp.dest('.tmp/scripts'));

	// concat thrid party CSS dependencies
	gulp.src(dependencies.concat.css)
		.pipe($.concat('vendor-concat.css'))
		.pipe(gulp.dest('.tmp/styles'));

	// concat generated polyfills to main.js
	gulp.src(dependencies.concat.js)
		.pipe($.concat('vendor-concat.js'))
		.pipe(gulp.dest('.tmp/scripts'));
});

gulp.task('concat:dist', ['serve-pre'], () => {
	// concat thrid party javscript dependencies
	gulp.src(dependencies.concat.js)
		.pipe($.concat('vendor-concat.js'))
		.pipe(gulp.dest('dist/scripts'));

	// concat thrid party CSS dependencies
	gulp.src(dependencies.concat.css)
		.pipe($.concat('vendor-concat.css'))
		.pipe(gulp.dest('dist/styles'));
});

gulp.task('copy:serve', ['serve-pre'], () => {
	// copy modernizr to .tmp
	gulp.src(dependencies.copy.js)
		.pipe($.debug())
		.pipe(gulp.dest('.tmp/scripts'));

	// copy font awesome fonts
	gulp.src(dependencies.copy.fonts)
		.pipe(gulp.dest('.tmp/fonts'));

	// copy favicon stuff to root of .tmp
	gulp.src('.tmp/favicon/*')
		.pipe(gulp.dest('.tmp'));
});

gulp.task('copy:dist', ['serve-pre'], () => {
	// copy modernizr to .tmp
	gulp.src(dependencies.copy.js)
		.pipe(gulp.dest('dist/scripts'));

	// copy font awesome fonts
	gulp.src(dependencies.copy.fonts)
		.pipe(gulp.dest('dist/fonts'));

	// copy custom scripts to dist
	gulp.src(['app/scripts/*.js', '.tmp/scripts/modernizr.js'])
		.pipe(gulp.dest('dist/scripts'));

	// copy custom styles to dist
	gulp.src(['.tmp/styles/*.*', '!.tmp/styles/vendor-concat.css'])
		.pipe(gulp.dest('dist/styles'));

	// copy favicon stuff to root of dist
	gulp.src('.tmp/favicon/*')
		.pipe(gulp.dest('dist'));

	// copy favicon stuff to root of dist
	gulp.src('app/content/**.*')
		.pipe(gulp.dest('dist/content'));
});

gulp.task('polyfill', function () {
	var files = ['app/scripts/*.js'];
	gulp.src(files)
		.pipe($.expectFile({
			checkRealFile: true,
			verbose: true
		}, files))
		.pipe($.autopolyfiller('polyfills-generated.js', {
			browsers: browsers
		}))
		.pipe(gulp.dest('app/scripts'));
});

gulp.task('favicon', ['jade'], (done) => {
	// create icons
	$.realFavicon.generateFavicon({
		masterPicture: 'app/images/logo-fusc.svg',
		dest: '.tmp/favicon',
		iconsPath: '/',
		design: {
			ios: {
				pictureAspect: 'backgroundAndMargin',
				backgroundColor: '#ffffff',
				margin: '14%',
				appName: 'Forrestfield United Soccer Club'
			},
			desktopBrowser: {},
			windows: {
				pictureAspect: 'noChange',
				backgroundColor: '#da532c',
				onConflict: 'override',
				appName: 'Forrestfield United Soccer Club'
			},
			androidChrome: {
				pictureAspect: 'backgroundAndMargin',
				margin: '13%',
				backgroundColor: '#ffffff',
				themeColor: '#eed911',
				manifest: {
					name: 'Forrestfield United Soccer Club',
					display: 'standalone',
					orientation: 'notSet',
					onConflict: 'override'
				}
			},
			safariPinnedTab: {
				pictureAspect: 'blackAndWhite',
				threshold: 90,
				themeColor: '#eed911'
			}
		},
		settings: {
			compression: 2,
			scalingAlgorithm: 'Mitchell',
			errorOnImageTooSmall: false
		},
		markupFile: FAVICON_DATA_FILE
	}, function() {
		done();
	});
	// add markup to html pages in .tmp folder
	gulp.src(['.tmp/*.html'])
		.pipe($.realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
		.pipe(gulp.dest('.tmp'));
});

gulp.task('deploy', [], () => {
	// var conn = ftp.create({
	// 	host: 'ftp.simcox.me',
	// 	user: 'asecondm',
	// 	password: 'Simmos90',
	// 	parallel: 10,
	// 	log: $.gulpUtil.log
	// });
	var conn = ftp.create( JSON.parse( fs.readFileSync('ftp.json') ) );

	var files = [
		'dist/**'
	];

	// using base = '.' will transfer everything to /public_html correctly
	// turn off buffering in gulp.src for best performance

	return gulp.src( files, { base: 'dist', buffer: false } )
		.pipe($.expectFile({
			checkRealFile: true,
			verbose: true
		}, files))
		// .pipe( conn.newer('/public_html/fusc-templates') ) // only upload newer files
		.pipe( conn.dest('/public_html/fusc-templates') );

} );

gulp.task('serve-pre', ['jade', /*'favicon',*/ 'styles', 'fonts', 'polyfill'], () => {
});

gulp.task('serve', ['serve-pre', 'concat:serve', 'copy:serve'], () => {
	browserSync({
		notify: false,
		port: 9000,
		server: {
			baseDir: ['.tmp', 'app'],
			routes: {
				'/bower_components': 'bower_components'
			}
		}
	});

	gulp.watch([
		'.tmp/*.html',
		'app/scripts/**/*.js',
		'app/images/**/*',
		'.tmp/fonts/**/*'
	]).on('change', reload);

	gulp.watch('app/jade/**/*.jade', ['jade']);

	gulp.watch('app/styles/**/*.scss', ['styles']);
	gulp.watch('app/fonts/**/*', ['fonts']);
	gulp.watch('app/scripts/**/*.js', ['lint']);
});

gulp.task('serve:dist', () => {
	browserSync({
		notify: false,
		port: 9000,
		server: {
			baseDir: ['dist']
		}
	});
});

gulp.task('serve:test', () => {
	browserSync({
		notify: false,
		port: 9000,
		ui: false,
		server: {
			baseDir: 'test',
			routes: {
				'/bower_components': 'bower_components'
			}
		}
	});

	gulp.watch('test/spec/**/*.js').on('change', reload);
	gulp.watch('test/spec/**/*.js', ['lint:test']);
});

gulp.task('build', ['lint', 'html', 'styles', 'polyfill', 'concat:dist', 'copy:dist', 'images', 'fonts', 'extras'], () => {
	return gulp.src('dist/**/*')/*.pipe($.size({title: 'build', gzip: true}))*/;
});

gulp.task('default', ['clean'], () => {
	gulp.start('build');
});
