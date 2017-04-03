/**
 * Created by Ramon on 02/04/2017.
 */
var gulp = require('gulp'),
    del         = require('del'),
    browserSync = require('browser-sync').create(),
    sass        = require('gulp-sass'),
    imagemin    = require('gulp-imagemin'),
    plumber     = require('gulp-plumber'),
    sourcemaps  = require('gulp-sourcemaps'),
    uglify      = require('gulp-uglify'),
    concat      = require('gulp-concat'),
    jshint      = require('gulp-jshint');
    gulpSequence= require('gulp-sequence');
    ts          = require('gulp-typescript');

var tsProject = ts.createProject('tsconfig.json');

//Definició de directoris d'origen
var srcPaths = {
    images: 'src/img/',
    script: 'src/js/',
    styles: 'src/sass/',
    typescripts: 'src/ts',
    files: 'src/',
    vendor: 'src/vendor',
    data: 'src/data'
};

//Definició de directoris destí
var distPaths = {
    images: 'dist/img/',
    scripts: 'dist/js/',
    styles: 'dist/css/',
    files: 'dist/'
};

//Neteja de directori de distribució
gulp.task('clean',function () {
  del([ distPaths.files+'*.html', distPaths.images+'**/*', distPaths.scripts+'*.js', distPaths.styles+'*.css']);
});

//Copiem els fitxers html al directori dest
gulp.task('devhtml', function() {
   return gulp.src([srcPaths.files+'*.html'])
       .pipe(gulp.dest(distPaths.files))
       .pipe(browserSync.stream());
});

gulp.task('prodhtml', function() {
    return gulp.src([srcPaths.files+'*.html'])
        .pipe(gulp.dest(distPaths.files));
});

gulp.task('vendor', function() {
    return gulp.src(srcPaths.vendor+'/**/*',{base:srcPaths.files})
        .pipe(gulp.dest(distPaths.files));
});

gulp.task('Data', function() {
    return gulp.src(srcPaths.data+'/**/*',{base: srcPaths.files})
        .pipe(gulp.dest(distPaths.files));
});

//Processament d'imatges
gulp.task('imagemin', function() {
    return gulp.src([srcPaths.images+'**.*'])
        .pipe(imagemin({
            progressive: true,
            interlaced: true,
            svgoPlugins: [{removeUnknownsAndDefaults: false},{cleanupID: false}]
        }))
        .pipe(gulp.dest(distPaths.images))
        .pipe(browserSync.stream());
});

//Processament SASS i Sourcemaps
gulp.task('devcss', function () {
    return gulp.src([srcPaths.styles+'**/*.scss'])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(sourcemaps.write())
        .pipe(plumber.stop())
        .pipe(gulp.dest(distPaths.styles))
        .pipe(browserSync.stream());
});

gulp.task('prodcss', function () {
    return gulp.src([srcPaths.styles+'**/*.scss'])
        .pipe(plumber())
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(plumber.stop())
        .pipe(gulp.dest(distPaths.styles))
});

gulp.task('devLINT', function(){
   return gulp.src([srcPaths.script+'**/*.js'])
       .pipe(jshint())
       .pipe(jshint.reporter(stylish));
});

gulp.task('devJS', ['devLINT'], function () {
   return gulp.src([srcPaths.script+'**/*', srcPaths.script+'app.jss'])
       .pipe(plumber())
       .pipe(sourcemaps.init())
       .pipe(concat('all.min.js'))
       .pipe(uglify())
       .pipe(sourcemaps.write('maps'))
       .pipe(plumber.stop())
       .pipe(gulp.dest(distPaths.scripts))
       .pipe(browserSync.stream());
});

gulp.task('devTYPESCRIPT', function() {
   var tsResult = tsProject.src()
       .pipe(plumber())
       .pipe(sourcemaps.init())
       .pipe(tsProject());

   return tsResult.js
       .pipe(concat('all.min.js'))
       .pipe(uglify())
       .pipe(sourcemaps.write())
       .pipe(plumber.stop())
       .pipe(gulp.dest(distPaths.scripts))
       .pipe(browserSync.stream());
});

gulp.task('prodTYPESCRIPT', function() {
   var tsResult = tsProject.src()
       .pipe(plumber())
       .pipe(tsProject());

   return tsProject.js
       .pipe(concat('all.min.js'))
       .pipe(uglify())
       .pipe(plumber.stop())
       .pipe(gulp.dest(distPaths.scripts))
});

gulp.task('SERVE', ['devhtml', 'vendor','Data', 'imagemin','devcss', 'devTYPESCRIPT'], function() {
   browserSync.init({
       logLevel: "info",
       proxy: "localhost/todoApp/dist",
       browser: ["chrome"]
   });

   gulp.watch(srcPaths.files+'*.html',['html']);
   gulp.watch(srcPaths.images+'**/*', ['imagemin']);
   gulp.watch(srcPaths.styles+'**/*.scss', ['css']);
   gulp.watch(srcPaths.typescripts+'**/*.ts', ['typescript']);
});

gulp.task('devBUILD', ['clean','devhtml','vendor','Data','imagemin','devcss','devcss','devTYPESCRIPT'], function() {});

gulp.task('prodBUILD', ['clean','prodhtml','vendor','Data','imagemin','prodcss','prodTYPESCRIPT'], function(){});

gulp.task('default', gulpSequence('clean','SERVE'));