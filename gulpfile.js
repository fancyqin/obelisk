var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var sourcemaps = require('gulp-sourcemaps');
var contentInclude = require('gulp-content-includer');
// var replace = require('gulp-replace');

gulp.task('sass', function () {
    return sass('src/css/**/*.scss',{sourcemap:true})
    
        .on('error', sass.logError)

        // For inline sourcemaps
        .pipe(sourcemaps.write())
        // For file sourcemaps
        .pipe(sourcemaps.write('maps', {
            includeContent: false,
            sourceRoot: 'source'
        }))
        .pipe(gulp.dest('src/css'));
});

gulp.task('watch', function () {
    gulp.watch('src/css/**/*css', ['sass']);
    gulp.watch('page/**/*.html',['concat']);
});

gulp.task('concat',function() {
    gulp.src("page/**/[!_]*.html")
        .pipe(contentInclude({
            includerReg:/<!\-\-include\s+"([^"]+)"\-\->/g
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('default',['sass','watch','concat']);