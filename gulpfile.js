// Dependencies
var gulp = require('gulp')
  , gulpLoadPlugins = require('gulp-load-plugins')
  , mainBowerFiles = require('main-bower-files')
  , browserSync = require('browser-sync')
  , browserReload = browserSync.reload

// Autoload Gulp tasks from package.json
var plugins = gulpLoadPlugins();

// Get js libs from assets/js/dependencies and main bower_component files
var localLibs = ['assets/js/dependencies/*.js'];
var bowerLibs = mainBowerFiles().map(function(x){ return __dirname+"/" ? x.replace(__dirname+"/","") : x });
var jsLibs = localLibs.concat(bowerLibs);

// Paths
var dirs = {
  dev: {
    config:  ['bower.json','package.json'],
    img:     ['assets/img/**/*.jpg',
              'assets/img/**/*.jpeg',
              'assets/img/**/*.gif',
              'assets/img/**/*.png'],
    svg:     ['assets/img/**/*.svg'],
    js:      ['assets/js/*.js'], // Specifically top-level only
    jslibs:  jsLibs,
    data:    ['assets/data/**/*.json'],
    sass:    ['assets/sass/**/*.scss'],
    fonts:   ['assets/fonts/**/*'],
    html:    ['assets/partials/**/*']
  },
  prod: {
    images:   '.tmp/public/images',
    scripts:  '.tmp/public/scripts',
    styles:   '.tmp/public/styles',
    views:    '.tmp/public/partials'
  }
}

gulp.task('install', function () {
  return gulp.src(dirs.dev.config)
  .pipe(plugins.install());
});

// ----------------------------------------------------------------
// Styles

  gulp.task('styles', function () {
    return gulp.src(dirs.dev.sass)
    .pipe(plugins.sass({
        errLogToConsole: true
    }))
    .pipe(plugins.autoprefixer("last 1 version", "> 1%", "ie 8", "ie 7"))
    .pipe(plugins.size({showFiles: true}))
    .pipe(plugins.minifyCss())
    // .pipe(plugins.csslint({
    //     'compatible-vendor-prefixes': false,
    //     'box-sizing': false,
    //     'important': false,
    //     'known-properties': false
    // }))
    // .pipe(plugins.csslint.reporter())
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(plugins.size({showFiles: true}))
    .pipe(gulp.dest(dirs.prod.styles))
    .pipe(browserSync.reload({stream:true}));
  });

  gulp.task('fonts', function() {
    return gulp.src(dirs.dev.fonts)
    .pipe(gulp.dest(dirs.prod.styles));
  });

// ----------------------------------------------------------------
// Javascript

  // Vendor JS
  gulp.task('libs', function() {
    return gulp.src(dirs.dev.jslibs)
    .pipe(plugins.concat('libs.min.js'))
    .pipe(plugins.size({showFiles: true}))
    .pipe(plugins.uglify({mangle: false}))
    .pipe(plugins.size({showFiles: true}))
    .pipe(gulp.dest(dirs.prod.scripts));
  });

  // Project JS
  gulp.task('scripts', function() {
    return gulp.src(dirs.dev.js)
    .pipe(plugins.concat('app.min.js'))
    .pipe(plugins.size({showFiles: true}))
    .pipe(plugins.uglify({mangle: false}))
    .pipe(plugins.size({showFiles: true}))
    .pipe(gulp.dest(dirs.prod.scripts));
  });

  // Datafiles
  gulp.task('data', function() {
    return gulp.src(dirs.dev.data)
    .pipe(gulp.dest(dirs.prod.scripts));
  });

  // Datafiles
  gulp.task('views', function() {
    return gulp.src(dirs.dev.html)
    .pipe(gulp.dest(dirs.prod.views));
  });

// ----------------------------------------------------------------
// Images

    gulp.task('rasters', function() {
      return gulp.src(dirs.dev.img)
      .pipe(plugins.cache(plugins.imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
      .pipe(gulp.dest(dirs.prod.images));
    });

    gulp.task('vectors', function() {
      return gulp.src(dirs.dev.svg)
      .pipe(plugins.svgmin())
      .pipe(plugins.replace(/_[0-9]+_/g, '')) // Illustrator SVGs; strip appended strings from id names
      .pipe(gulp.dest(dirs.prod.images));
    });

// ----------------------------------------------------------------
// Start server & reload on CSS changes

    gulp.task('browser-sync', function() {
        browserSync.init(null, { server: { baseDir: "./" } });
    });

    // Function to call for reloading browsers
    gulp.task('bs-reload', function () {
        browserSync.reload();
    });

// ----------------------------------------------------------------
// Tasks

gulp.task('watch', function() {
  gulp.watch(dirs.dev.js,     ['scripts']);
  gulp.watch(dirs.dev.libs,   ['libs']);
  gulp.watch(dirs.dev.data,   ['data']);
  //
  gulp.watch(dirs.dev.sass,   ['styles']);
  gulp.watch(dirs.prod.styles,['bs-reload']);
  //
  gulp.watch(dirs.dev.fonts,  ['fonts']);
  gulp.watch(dirs.dev.img,    ['rasters']);
  gulp.watch(dirs.dev.svg,    ['vectors']);
  //
  gulp.watch(dirs.dev.html,   ['views']);
  gulp.watch(dirs.prod.views, ['bs-reload']);
});

gulp.task('start', ['bs-reload']);
gulp.task('assets', ['rasters', 'vectors', 'fonts']);
gulp.task('build', ['styles', 'scripts', 'libs', 'views', 'data']);
gulp.task('init', ['install', 'build', 'assets', 'watch', 'start']);
gulp.task('default', ['build', 'watch', 'start']);
