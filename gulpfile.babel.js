import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;


/*
	These are third party dependencies from bower tp be copied or concatenated. Generally you would want to concat any js and css dependencies.
 */
const dependencies = {
	concat: {
		js: [
			'bower_components/jquery/dist/jquery.js', 
			'bower_components/bxslider-4/dist/jquery.bxslider.js',
			'bower_components/gsap/src/uncompressed/TweenMax.js',
			'bower_components/enquire/dist/enquire.js'
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

gulp.task('serve', ['jade', 'styles', 'fonts', 'polyfill', 'concat:serve', 'copy:serve'], () => {
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

gulp.task('concat:serve', function() {
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

gulp.task('concat:dist', function() {
	// concat thrid party javscript dependencies
	gulp.src(dependencies.concat.js)
		.pipe($.concat('vendor-concat.js'))
		.pipe(gulp.dest('dist/scripts'));

	// concat thrid party CSS dependencies
	gulp.src(dependencies.concat.css)
		.pipe($.concat('vendor-concat.css'))
		.pipe(gulp.dest('dist/styles'));
});

gulp.task('copy:serve', function() {
	// copy modernizr to .tmp
	gulp.src(dependencies.copy.js)
		.pipe(gulp.dest('.tmp/scripts'));

	// copy font awesome fonts
	gulp.src(dependencies.copy.fonts)
		.pipe(gulp.dest('.tmp/fonts'));
});

gulp.task('copy:dist', function() {
	// copy modernizr to .tmp
	gulp.src(dependencies.copy.js)
		.pipe(gulp.dest('dist/scripts'));

	// copy font awesome fonts
	gulp.src(dependencies.copy.fonts)
		.pipe(gulp.dest('dist/fonts'));
});

gulp.task('build', ['lint', 'html', 'polyfill', 'concat:dist', 'copy:dist', 'images', 'fonts', 'extras'], () => {
	return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], () => {
	gulp.start('build');
});
