'use strict';

var gulp = require('gulp');

// Load plugins
var $ = require('gulp-load-plugins')();


// Styles
gulp.task('styles', function () {
    return gulp.src('app/styles/main.scss')
        .pipe($.rubySass({
            style: 'expanded',
            precision: 10,
            loadPath: ['app/bower_components']
        }))
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('dist/styles'))
        .pipe($.size())
        .pipe($.connect.reload());
});




// CoffeeScript
gulp.task('coffee', function () {
    return gulp.src(
            ['app/scripts/**/*.coffee', '!app/scripts/**/*.js'],
            {base: 'app/scripts'}
        )
        .pipe(
            $.coffee({ bare: true }).on('error', $.util.log)
        )
        .pipe(gulp.dest('app/scripts'));
});


// Scripts
gulp.task('scripts', function () {
    return gulp.src('app/scripts/app.js')
        .pipe($.browserify({
            insertGlobals: true,
            transform: ['reactify', 'coffee-reactify']
        }))
        .pipe(gulp.dest('dist/scripts'))
        .pipe($.size())
        .pipe($.connect.reload());
    });



gulp.task('jade', function () {
    return gulp.src('app/template/*.jade')
        .pipe($.jade({ pretty: true }))
        .pipe(gulp.dest('dist'))
        .pipe($.connect.reload());
})



// HTML
gulp.task('html', function () {
    return gulp.src('app/*.html')
        .pipe($.useref())
        .pipe(gulp.dest('dist'))
        .pipe($.size())
        .pipe($.connect.reload());
});

// Images
gulp.task('images', function () {
    return gulp.src('app/images/**/*')
        .pipe($.cache($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
        .pipe($.size())
        .pipe($.connect.reload());
});

// Clean
gulp.task('clean', function () {
    return gulp.src(['dist/styles', 'dist/scripts', 'dist/images'], {read: false}).pipe($.clean());
});


// Bundle
gulp.task('bundle', ['styles', 'scripts', 'bower'], function(){
    return gulp.src('./app/*.html')
               .pipe($.useref.assets())
               .pipe($.useref.restore())
               .pipe($.useref())
               .pipe(gulp.dest('dist'));
});

// Build
gulp.task('build', ['html', 'bundle', 'images']);

// Default task
gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

// Connect
gulp.task('connect', $.connect.server({
    root: ['dist'],
    port: 9000,
    livereload: true
}));

// Bower helper
gulp.task('bower', function() {
    gulp.src('app/bower_components/**/*.js', {base: 'app/bower_components'})
        .pipe(gulp.dest('dist/bower_components/'));

});

gulp.task('json', function() {
    gulp.src('app/scripts/json/**/*.json', {base: 'app/scripts'})
        .pipe(gulp.dest('dist/scripts/'));
});


// Watch
gulp.task('watch', ['html', 'bundle', 'connect'], function () {

    // Watch .json files
    gulp.watch('app/scripts/**/*.json', ['json']);

    // Watch .html files
    gulp.watch('app/*.html', ['html']);

    
    // Watch .scss files
    gulp.watch('app/styles/**/*.scss', ['styles']);
    


    // Watch .jade files
    gulp.watch('app/template/**/*.jade', ['jade', 'html']);



    // Watch .coffeescript files
    gulp.watch('app/scripts/**/*.coffee', ['coffee', 'scripts']);


    // Watch .js files
    gulp.watch('app/scripts/**/*.js', ['scripts']);

    // Watch .cjsx files
    gulp.watch('app/scripts/**/*.cjsx', ['scripts']);

    // Watch image files
    gulp.watch('app/images/**/*', ['images']);
});
