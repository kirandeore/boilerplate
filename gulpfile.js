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
    gulpif = require('gulp-if');


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
    console.log(ops.debug + " hey");
    gulp.src('src/public/app/viewmodels/*.js')
    //gulp.src(['src/app/viewmodels/*.js', '!src/app/viewmodels/*.min.js'])
        .pipe(plumber()) //plumber is initialized before JS is checked for errors by renaming and uglify modules
        .pipe(rename({suffix:'.min'}))
        .pipe(gulpif(!ops.debug, uglify()))
        .pipe(gulp.dest('build/public/app/viewmodels'));

});

//compile scss
gulp.task('buildCss', function(){
    gulp.src('src/public/app/scss/*.scss')
        .pipe(plumber())  //plumber is initialized before compass compiles
        .pipe(compass({
            config_file: './config.rb',
            css: 'build/public/app/css',
            sass: 'src/public/app/scss',
            require: ['susy']
        }))
        .pipe(gulp.dest('build/public/app/css'));
});

//move HTML files to build
gulp.task('buildHtml', function(){
    gulp.src('src/public/app/views/*.html')
        .pipe(plumber())  //plumber is initialized
        .pipe(gulp.dest('build/public/app/views'));

    gulp.src('src/public/index.html')
        .pipe(plumber())  //plumber is initialized
        .pipe(gulp.dest('build/public'))
        //.pipe(reload({stream: true})); //browser sync reload is last step after moving files;
});

//clean build folder
gulp.task('clean-folder', function(cb){
    del(['build/**'], cb);
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
    gulp.watch('src/public/app/scss/*.scss', function(){
        runSequence('buildCss', reload);
    });

    //watch build folder for changes and restart the browsers
    gulp.watch('src/public/**/*.html', function(){
        runSequence('buildHtml', reload);
    });
});

gulp.task("build", function(cb){
    if(argv.debug){
        ops.debug = true;
    }

    //ops.buildOnly = true;

    runSequence('clean-folder', ['buildHtml', 'buildViewmodels', 'buildCss'], cb);
});

gulp.task("default", function(cb){
    if(argv.debug){
        ops.debug = true;
    }

    runSequence(['buildCss', 'buildHtml', 'buildViewmodels'],'watch', cb);
});
