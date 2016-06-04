/*global require*/

'use strict';

var browserify = require('browserify');
var bust = require('gulp-buster');
var es = require('event-stream');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var rev = require('gulp-rev');

function runBrowserify() {
  var b = browserify({
    entries: './src/script.js',
    debug: false
  });

  return b.bundle()
    .pipe(source('script.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    // Add transformation tasks to the pipeline here.
    .pipe(uglify())
    .on('error', gutil.log);
}

gulp.task('build', function() {
    return es.merge(gulp.src('./src/*.css'), runBrowserify())
        .pipe(rev())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./dist'));
});

gulp.task('copy', function() {
    return gulp.src(['./src/images/*'])
        .pipe(gulp.dest('dist/images'));
});

gulp.task('default', ['build', 'copy']);
