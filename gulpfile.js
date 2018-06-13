const path = require('path');
const gulp = require('gulp');
const flatten = require('gulp-flatten');
const rename = require('gulp-rename');
const changed = require('gulp-changed');
const svg_sprite = require('gulp-svg-sprite');
const browser_sync = require('browser-sync').create();
const bs_config = require('./bs-config.js');
const Bundler = require('parcel-bundler');
const gulp_sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const themekit = require('@shopify/themekit');
const del = require('del');
const chalk = require('chalk');

// Set NODE_ENV
process.env.NODE_ENV = 'development';

function set_dev(done) {
    process.env.NODE_ENV = 'development';
    done();
}

function set_prod(done) {
    process.env.NODE_ENV = 'production';
    done();
}

// Clear Dist
function clear(done) {
    del.sync('dist/**/*');
    done();
}

// BrowserSync
function sync(done) {
    browser_sync.init(bs_config);
    done();
}

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

function sprites() {
	return gulp.src('src/assets/icons/**/*.svg')
    	.pipe(svg_sprite(sprite_config))
    	.pipe(gulp.dest('src/snippets'));
};

function watch_sprites(done) {
    gulp.watch('src/assets/icons/**/*.svg', sprites);
    done();
}

// Assets
function assets() {
    return gulp.src(['src/assets/**/*', '!src/assets/{scripts,styles,icons}/**/*'])
		.pipe(changed('dist'))
        .pipe(flatten())
        .pipe(gulp.dest('dist/assets'));
}

function watch_assets(done) {
    let globs = [
        'src/assets/**/*',
        '!src/assets/{scripts,styles,icons}',
        '!src/assets/{scripts,styles,icons}/**/*'
    ];

    let watcher = gulp.watch(globs);

    // Update
	watcher.on('change', function(file, stats) {
        console.log(chalk.magenta('[UPDATED] ') + chalk.blue(path.basename(file)));
        assets();
	});

    // Add
	watcher.on('add', function(file, stats) {
        console.log(chalk.green('[ADDED] ') + chalk.blue(path.basename(file)));
        assets();
	});

    // Delete
	watcher.on('unlink', function(file, stats) {
        console.log(chalk.red('[DELETED] ') + chalk.blue(path.basename(file)));
        return del.sync('dist/assets/' + path.basename(file));
	});
    done();
}

let watch_all_assets = gulp.series(assets, sprites, watch_assets, watch_sprites);

// Template files
function liquid() {
    return gulp.src(['src/**/*', '!src/assets', '!src/assets/**/*'])
        .pipe(changed('dist'))
        .pipe(gulp.dest('dist'));
}

let watch_liquid = gulp.series(liquid, function(done) {
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
});

// Compile sass
function sass() {
    return gulp.src('src/assets/styles/*.scss')
        .pipe(gulp_sass({ outputStyle: 'compressed', sourceMapEmbed: process.env.NODE_ENV == 'production' ? true : false }).on('error', gulp_sass.logError))
        .pipe(postcss([autoprefixer()], {map: process.env.NODE_ENV == 'development'}))
        .pipe(rename({extname: '.css.liquid'}))
        .pipe(gulp.dest('dist/assets'));
}

// Watch sass
watch_sass = gulp.series(sass, function(done) {
    gulp.watch('src/assets/styles/**/*.scss', sass);
    done();
});

// Parcel
const entry_file = path.join(__dirname, './src/assets/scripts/theme.js');

function parcel(done) {
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
};

// Themekit
function theme_watch(done) {
    themekit.command({
        args: ['watch', '--dir', 'dist', '--notify=theme.update']
    }, function(err) {
        if (err) {
            console.error(err);
            return;
        }
    });
    done();
};

function theme_deploy(done) {
    themekit.command({
        args: ['replace', '--env', process.env.NODE_ENV, '--dir', 'dist']
    }, function(err) {
        if (err) {
            console.error(err);
            return;
        }
        console.log(chalk.green('Theme has been deployed'));
    });
    done();
};

function theme_update(done) {
    themekit.command({
        args: ['upload', '--env', process.env.NODE_ENV, '--dir', 'dist']
    }, function(err) {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Theme has been updated');
    });
    done();
};

// Tasks for npm scripts
let build_commands = [
    set_prod,
    clear,
    sprites,
    assets,
    sass,
    liquid,
    parcel
];

let deploy_commands = [
    'build',
    theme_deploy
];

let update_commands = [
    'build',
    theme_update
];

let watch_commands = [
    set_dev,
    clear,
    watch_all_assets,
    watch_sass
    watch_liquid,
    parcel,
    theme_watch,
    sync
];

gulp.task('build', gulp.series(build_commands));

gulp.task('deploy', gulp.series(deploy_commands));

gulp.task('update', gulp.series(update_commands));

gulp.task('watch', gulp.series(watch_commands));
