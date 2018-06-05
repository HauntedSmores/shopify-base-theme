const path = require('path');
const gulp = require('gulp');
const flatten = require('gulp-flatten');
const rename = require('gulp-rename');
const changed = require('gulp-changed');
const svg_sprite = require('gulp-svg-sprite');
const browser_sync = require('browser-sync').create();
const bs_config = require('./bs-config.js');
const Bundler = require('parcel-bundler');
const themekit = require('@shopify/themekit');
const del = require('del');
const chalk = require('chalk');

// Set NODE_ENV
process.env.NODE_ENV = 'development';

gulp.task('set-dev', function(done) {
    process.env.NODE_ENV = 'development';
    done();
});

gulp.task('set-prod', function(done) {
    process.env.NODE_ENV = 'production';
    done();
});

// Clear Dist
gulp.task('clear', function(done) {
    del.sync('dist/**/*');
    done();
});

// BrowserSync
gulp.task('browser-sync', function(done) {
    browser_sync.init(bs_config);
    done();
});

// Sprite sheet
const sprite_config = {
	mode: {
		symbol: {
            dest: '',
			inline: true,
            sprite: 'icons.liquid',
		}
	},
    shape: {
        transform: [{
            svgo: {
                plugins: [
                    { removeViewBox: false },
                    { removeDimensions: true }
                ]
            }
        }]
    }
};

gulp.task('sprite-sheet', function() {
	return gulp.src('src/assets/images/icons/**/*.svg', {since: gulp.lastRun('sprite-sheet')})
	.pipe(svg_sprite(sprite_config))
	.pipe(gulp.dest('src/snippets'));
});

// Migrate assets
gulp.task('assets', gulp.series('sprite-sheet', function() {
    return gulp.src(['src/assets/**/*', '!src/assets/{scripts,styles,icons}/**/*'])
		.pipe(changed('dist'))
        .pipe(flatten())
        .pipe(gulp.dest('dist/assets'));
}));

gulp.task('assets:watch', gulp.series('assets', function(done) {
    let globs = [
        'src/assets/**/*',
        '!src/assets/{scripts,styles,images/icons}',
        '!src/assets/{scripts,styles,images/icons}/**/*'
    ];
    let watcher = gulp.watch(globs);

    // Update
	watcher.on('change', function(file, stats) {
        console.log(chalk.magenta('[UPDATED] ') + chalk.blue(path.basename(file)));
        return gulp.src(['src/assets/**/*', '!src/assets/{scripts,styles}/**/*', '!src/assets/images/icons/**/*'])
            .pipe(changed('dist/assets'))
            .pipe(flatten())
            .pipe(gulp.dest('dist/assets'));
	});

    // Add
	watcher.on('add', function(file, stats) {
        console.log(chalk.green('[ADDED] ') + chalk.blue(path.basename(file)));
        return gulp.src(['src/assets/**/*', '!src/assets/{scripts,styles}/**/*', '!src/assets/images/icons/**/*'])
            .pipe(changed('dist/assets'))
            .pipe(flatten())
            .pipe(gulp.dest('dist/assets'));
	});

	watcher.on('unlink', function(file, stats) {
        console.log(chalk.red('[DELETED] ') + chalk.blue(path.basename(file)));
        return del.sync('dist/assets/' + path.basename(filea));
	});
    done();
}));

// Migrate template files
gulp.task('migrate', function() {
    return gulp.src(['src/**/*', '!src/assets', '!src/assets/**/*'])
        .pipe(changed('dist'))
        .pipe(gulp.dest('dist'));
});

gulp.task('migrate:watch', gulp.series('migrate', function(done) {
    let watcher = gulp.watch(['src/**/*', '!src/assets', '!src/assets/**/*']);

    // Update
	watcher.on('change', function(file, stats) {
        console.log(chalk.magenta('[UPDATED] ') + chalk.blue(path.basename(file)));
        return gulp.src(['src/**/*', '!src/assets', '!src/assets/**/*'])
            .pipe(changed('dist'))
            .pipe(gulp.dest('dist'));
	});

    // Add
	watcher.on('add', function(file, stats) {
        console.log(chalk.green('[ADDED] ') + chalk.blue(path.basename(file)));
        return gulp.src(['src/**/*', '!src/assets', '!src/assets/**/*'])
            .pipe(changed('dist'))
            .pipe(gulp.dest('dist'));
	});

	watcher.on('unlink', function(file, stats) {
        console.log(chalk.red('[DELETED] ') + chalk.blue(path.basename(file)));
        return del.sync('dist/**/' + path.basename(file));
	});
    done();
}));

// Parcel
const entry_file = path.join(__dirname, './src/assets/scripts/theme.js');

gulp.task('parcel', function(done) {
    // Bundler options
    let parcel_options = {
      outDir: './dist/assets', // The out directory to put the build files in, defaults to dist
      watch: process.env.NODE_ENV == 'development', // whether to watch the files and rebuild them on change, defaults to process.env.NODE_ENV !== 'production'
      minify: process.env.NODE_ENV == 'production', // Minify files, enabled if process.env.NODE_ENV === 'production'
      logLevel: process.env.NODE_ENV == 'development' ? 3 : 2, // 3 = log everything, 2 = log warnings & errors, 1 = log errors
      sourceMaps: process.env.NODE_ENV == 'development', // Enable or disable sourcemaps, defaults to enabled (not supported in minified builds yet)
    };

    // Initialises a bundler using the entrypoint location and options provided
    const bundler = new Bundler(entry_file, parcel_options);

    bundler.bundle().then(() => done());
});

// Themekit
gulp.task('theme:watch', function(done) {

    themekit.command({
        args: ['watch', '--dir', 'dist', '--notify=theme.update']
    }, function(err) {
        if (err) {
            console.error(err);
            return;
        }
    });
    done();
});

gulp.task('theme:deploy', function(done) {
    themekit.command({
        args: ['replace', '--env', process.env.NODE_ENV, '--dir', 'dist']
    }, function(err) {
        if (err) {
            console.error(err);
            return;
        }
        console.log(chalk.green('Theme has been deployed'));
        done();
    });
});

gulp.task('theme:update', function(done) {
    themekit.command({
        args: ['upload', '--env', process.env.NODE_ENV, '--dir', 'dist']
    }, function(err) {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Theme has been updated');
        done();
    });
});

gulp.task('build', gulp.series('set-prod', 'clear', 'sprite-sheet', 'assets', 'migrate', 'parcel'));

gulp.task('deploy', gulp.series('set-prod', 'build', 'theme:deploy'));

gulp.task('update', gulp.series('set-prod', 'build', 'theme:update'));

gulp.task('watch', gulp.series('set-dev', 'clear', 'assets:watch', 'migrate:watch', 'parcel', 'theme:watch', 'browser-sync'));
