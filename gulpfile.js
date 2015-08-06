var gulp = require("gulp"),
    //for minifying js
    uglify = require("gulp-uglify"),
    //renaming file , for instance min.js
    rename = require('gulp-rename'),
    //for compiling and minify scss files
    compass = require('gulp-compass'),
    //if compile errors, plumber won't stop the server
    plumber = require('gulp-plumber'),
    //delete files module
    del = require('del'),
    //run the tasks in sequence
    runSequence = require('run-sequence'),
    //reload browser after client code changes
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    //this module can parse arguments
    argv = require('yargs').argv,
    //if else conditions in gulp
    gulpif = require('gulp-if'),
    //gulp-util logs errors
    gutil = require('gulp-util'),
    //set permissions on files and folders
    chmod = require('gulp-chmod');

var ops = {
  debug: false
};

//tasks
gulp.task("testGulpTask", function(){
    console.log("scripts!!");
});

gulp.task("buildViewmodels", function(){

    // glob patterns
    // css/*.css   include css files
    // css/**/*.css include all css from subdirectories too
    // !css/style.css  exclude style.css
    // *.+(js|css)  include js and css files
    gulp.src('src/public/app/viewmodels/*.js')
    //gulp.src(['src/app/viewmodels/*.js', '!src/app/viewmodels/*.min.js'])
        .pipe(plumber()) //plumber is initialized before JS is checked for errors by renaming and uglify modules
        //.pipe(rename({suffix:'.min'}))
        .pipe(gulpif(!ops.debug, uglify().on('error', gutil.log)))
        .pipe(chmod(777))
        .pipe(gulp.dest('build/public/app/viewmodels'));

    gulp.src('src/public/app/main.js')
        .pipe(plumber())
        .pipe(rename({suffix:'.min'}))
        .pipe(gulpif(!ops.debug, uglify().on('error', gutil.log)))
        .pipe(gulp.dest('build/public/app'));
});

//compile scss
gulp.task('buildCss', function(){
    gulp.src(['src/public/app/scss/*.scss', 'src/public/app/css/*.css'])
        .pipe(plumber())  //plumber is initialized before compass compiles
        .pipe(chmod(777))
        .pipe(gulp.dest('build/public/app/css'));
});

//move UI libraries
gulp.task('buildUIlib', function(){
    gulp.src(['src/public/lib/**', 'bower_components/**'])
        .pipe(plumber())  //plumber is initialized before compass compiles
        .pipe(gulp.dest('build/public/lib'));
});

//move images to build
gulp.task('buildAssets', function(){
    gulp.src('src/public/app/assets/**')
        .pipe(plumber())  //plumber is initialized before compass compiles
        .pipe(chmod(777))
        .pipe(gulp.dest('build/public/app/assets'));
});

//move HTML files to build
gulp.task('buildHtml', function(){
    gulp.src('src/public/app/views/*.html')
        .pipe(plumber())  //plumber is initialized
        .pipe(chmod(777))
        .pipe(gulp.dest('build/public/app/views'));

    gulp.src('src/public/index.html')
        .pipe(plumber())  //plumber is initialized
        .pipe(chmod(777))
        .pipe(gulp.dest('build/public'))
        //.pipe(reload({stream: true})); //browser sync reload is last step after moving files;
});

//clean build/public folder
gulp.task('cleanui-folder', function(cb){
    del(['build/public/**'], cb);
});

gulp.task('watch', function(){
    browserSync({
        //proxy: 'localhost:3000',
        port: 44085,
        open: true,
        notify: true,
        reloadDelay: 1000,
        reloadDebounce: 1000,
        server: {
            baseDir: "./build/public"
        }
    });

    //watch the src folder for changes and compile it to build
    gulp.watch('src/public/app/viewmodels/*.js', function(){
        runSequence('buildViewmodels', reload);
    });
    gulp.watch(['src/public/app/scss/*.scss', 'src/public/app/css/*.css'], function(){
        runSequence('buildCss', reload);
    });

    //watch build folder for changes and restart the browsers
    gulp.watch('src/public/**/*.html', function(){
        runSequence('buildHtml', reload);
    });

    gulp.watch(['src/public/lib/**', 'bower_components/**'], function(){
        runSequence('buildUIlib', reload);
    });

    gulp.watch('src/public/app/assets/**', function(){
        runSequence('buildAssets', reload);
    });
});

gulp.task("buildui", function(cb){
    if(argv.debug){
        ops.debug = true;
    }

    //ops.buildOnly = true;

    runSequence('cleanui-folder', ['buildHtml', 'buildViewmodels', 'buildCss', 'buildUIlib', 'buildAssets'], cb);
});

gulp.task("default", function(cb){
    if(argv.debug){
        ops.debug = true;
    }

    runSequence('buildui','watch', cb);
});
