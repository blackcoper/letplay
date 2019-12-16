var gulp = require('gulp'),
  $ = require('gulp-load-plugins')(),
  bowerFiles = require('main-bower-files'),
  concat = require('gulp-concat-sourcemap'),
  deploy = require('gulp-gh-pages'),
  del = require('del'),

  jsLint = require('gulp-jshint'),
  jsLintReporter = require('jshint-stylish'),

  runSequence = require('run-sequence');

var paths = {
  assets: 'src/assets/**/*',
  css: 'src/css/*',
  index: 'src/index.html',
  js: ['src/js/*','src/js/objects/*'],
  // js: ['src/js/*','!src/js/_*/','!src/js/_*/**/*'],
  vendor: ['src/js/_*/','src/js/_*/**/*'],
  build: 'build',
  dist: 'dist'
};

gulp.task('clean', function (cb) {
  return del([paths.build, paths.dist],cb);
});

gulp.task('dev',function(){
  return gulp.src(paths.js)
    .pipe(gulp.dest(paths.build+'/src/js'));
})

gulp.task('copyDist', function () {
  return gulp.src(paths.assets)
    .pipe(gulp.dest(paths.dist + '/assets'));
});

gulp.task('copyBuild', function () {
  return gulp.src(paths.assets)
    .pipe(gulp.dest(paths.build + '/assets'));
});

gulp.task('lintJs', function() {
    return gulp.src(paths.js)
        .pipe(jsLint())
        .pipe(jsLint.reporter(jsLintReporter));
});

// var tsProject = $.typescript.createProject({
//   declarationFiles: true,
//   noExternalResolve: true,
//   sortOutput: true,
//   sourceRoot: '../scripts'
// });
//
// gulp.task('typescript', function () {
//   var tsResult = gulp.src(paths.ts)
//     .pipe($.sourcemaps.init())
//     .pipe($.typescript(tsProject));
//
//   return tsResult.js
//     .pipe(concat('main.js'))
//     .pipe($.sourcemaps.write())
//     .pipe(gulp.dest(paths.build));
// });
gulp.task('scripts', function() {
    return gulp.src(paths.js)
      // .pipe($.sourcemaps.init())
      .pipe(concat('main.js'))
      // .pipe($.sourcemaps.write())
      .pipe(gulp.dest(paths.build));
});

gulp.task('vendor', function() {
    return gulp.src(paths.vendor)
      .pipe(gulp.dest(paths.build));
});

gulp.task('css', function () {
  return gulp.src(paths.css)
    .pipe(gulp.dest(paths.build));
});

gulp.task('processhtml', function () {
  return gulp.src(paths.index)
    .pipe($.processhtml())
    .pipe(gulp.dest(paths.dist));
});

gulp.task('inject', function () {
  return gulp.src(paths.index)
    .pipe($.inject(gulp.src(bowerFiles()), {name: 'bower', relative: true}))
    .pipe(gulp.dest('src'));
});

gulp.task('reload', ['scripts'], function () {
  gulp.src(paths.index)
    .pipe($.connect.reload());
});

gulp.task('watch', function () {
  gulp.watch(paths.assets, ['copyDist','copyBuild', 'reload']),
  gulp.watch(paths.js, ['scripts', 'reload']);
  gulp.watch(paths.css, ['css', 'reload']);
  gulp.watch(paths.index, ['reload']);
});

gulp.task('connect', function () {
  $.connect.server({
    root: [__dirname + '/src', paths.build],
    port: 80,
    livereload: true
  });
});

gulp.task('open', function () {
  // gulp.src(paths.index)
  //   .pipe($.open('', {uri: 'http://localhost'}));
    gulp.src(paths.index)
  .pipe($.open({uri: 'http://localhost/'}));
});

gulp.task('minifyJs', ['scripts'], function () {
  var all = bowerFiles().concat(paths.build + '/main.js');
  return gulp.src(all)
    .pipe($.uglifyjs('all.min.js', {outSourceMap: false}))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('minifyCss', ['css'], function () {
  return gulp.src(paths.build + '/style.css')
    .pipe($.minifyCss())
    .pipe(gulp.dest(paths.dist))
});

gulp.task('deploy', function () {
  return gulp.src('dist/**/*')
    .pipe(deploy());
});

gulp.task('default', function () {
  runSequence('clean', ['inject','dev','copyBuild','scripts','vendor','css','connect','watch'],'open');
});
gulp.task('build', function () {
  return runSequence('clean', ['copyDist', 'minifyJs', 'vendor', 'minifyCss', 'processhtml']);
});
