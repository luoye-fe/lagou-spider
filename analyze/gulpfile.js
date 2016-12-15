const path = require('path');

const gulp = require('gulp');
const cssmin = require('gulp-cssmin');
const uglifyjs = require('gulp-uglify');
const babel = require('gulp-babel');

gulp.task('js', () => {
	return gulp.src('./public/src/*.js')
		.pipe(babel())
		.pipe(uglifyjs())
		.pipe(gulp.dest('./public/dist'))
});

gulp.task('css', () => {
	return gulp.src('./public/src/*.css')
		.pipe(cssmin())
		.pipe(gulp.dest('./public/dist'))
});

gulp.task('default', ['js', 'css']);
