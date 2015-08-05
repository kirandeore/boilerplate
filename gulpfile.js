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
    reload = browserSync.reload;


browserSync({
    //proxy: 'localhost:3000',
    port: 44085,
    open: true,
    notify: true,
    reloadDelay: 1000,
    reloadDebounce: 1000,
    server: {
           baseDir: "./build/"
        }
});

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

    gulp.src('src/app/viewmodels/*.js')
    //gulp.src(['src/app/viewmodels/*.js', '!src/app/viewmodels/*.min.js'])
        .pipe(plumber()) //plumber is initialized before JS is checked for errors by renaming and uglify modules
        .pipe(rename({suffix:'.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('build/app/viewmodels'))
 //       .pipe(reload({stream: true})); //browser sync reload is last step after moving files

    console.log("scripts!!");
});

//compile scss
gulp.task('buildCss', function(){
    gulp.src('src/app/scss/*.scss')
        .pipe(plumber())  //plumber is initialized before compass compiles
        .pipe(compass({
            config_file: './config.rb',
            css: 'build/app/css',
            sass: 'src/app/scss',
            require: ['susy']
        }))
        .pipe(gulp.dest('build/app/css'))
        //.pipe(reload({stream: true})); //browser sync reload is last step after moving files
});

//move HTML files to build
gulp.task('buildHtml', function(){
    gulp.src('src/app/views/*.html')
        .pipe(plumber())  //plumber is initialized
        .pipe(gulp.dest('build/app/views'));

    gulp.src('src/index.html')
        .pipe(plumber())  //plumber is initialized
        .pipe(gulp.dest('build'))
        //.pipe(reload({stream: true})); //browser sync reload is last step after moving files;
});

//clean build folder
gulp.task('clean-folder', function(cb){
    del(['build/**', '!build'], cb);
});

gulp.task('watch', function(){
    //watch the src folder for changes and compile it to build
    gulp.watch('src/app/viewmodels/*.js', function(){
        runSequence('buildViewmodels', reload);
    });
    gulp.watch('src/app/scss/*.scss', function(){
        runSequence('buildCss', reload);
    });

    //watch build folder for changes and restart the browsers
    gulp.watch('src/**/*.html', function(){
        runSequence('buildHtml', reload);
    });
});

//configure browser sync
//gulp.task('browser-sync', function(){
//    browserSync({
//        server: {
//            baseDir: "./build/"
//        }
//    });
//});

//default task
//browser-sync is added right before watch in order to configure it
//gulp.task("default", ['buildViewmodels', 'buildCss', 'buildHtml', 'browser-sync','watch']);
gulp.task("default", function(cb){
    runSequence(['buildCss', 'buildHtml', 'buildViewmodels'],'watch', cb);
});
