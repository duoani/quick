
var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    plugins = require('gulp-load-plugins')(),
    es = require('event-stream');

var jsFiles = [
    'src/js/ui.js',
    'src/js/ui.ctrlnum.js',
    'src/js/ui.district.js',
    'src/js/ui.slider.js',
    'src/js/ui.gallery.js',
    'src/js/ui.infinite.js',
    'src/js/ui.input.js',
    'src/js/ui.loading.js',
    'src/js/ui.lazyload.js',
    'src/js/ui.modal.js',
    'src/js/ui.scrollable.js',
    'src/js/ui.scrollwatcher.js',
    'src/js/ui.tab.js',
    'src/js/ui.textarea.js',
    'src/js/ui.uploader.js',
];

gulp.task('build:js', function () {
    return es.merge(
        gulp.src(jsFiles)
            .pipe(plugins.uglify())
            .pipe(gulp.dest('dist/js'))
            .pipe(plugins.concat('quick.min.js'))
            .pipe(gulp.dest('dist/js')),
        gulp.src(jsFiles)
            .pipe(plugins.concat('quick.src.js'))
            .pipe(gulp.dest('dist/js'))
    );
});

gulp.task('build:lib', function(cb){
    return gulp.src('lib/*.js')
            .pipe(plugins.uglify())
            .pipe(gulp.dest('dist/lib'));
});

gulp.task('build:sass', function () {
    //不编译以下划线开头的sass文件
    return gulp.src(['src/scss/**/*.scss', '!_*.scss'])
            .pipe(plugins.sass({outputStyle: 'expanded'}).on('error', plugins.sass.logError))
            .pipe(plugins.rename('quick.src.css'))
            .pipe(gulp.dest('dist/css'))
            .pipe(plugins.minifyCss({advanced: false}))
            .pipe(plugins.rename('quick.min.css'))
            .pipe(gulp.dest('dist/css'));
});

gulp.task('assets', function () {
    return gulp.src('src/images/**')
            .pipe(gulp.dest('dist/images'));
});

gulp.task('clean', function () {
    return gulp.src('dist/', {read: false})
            .pipe(plugins.clean());
});

gulp.task("default", function(cb){
    runSequence("clean", ["build:js", "build:lib", "build:sass", "assets"], cb);
});

//-------  以下为监控sass文件的监听任务  --------
gulp.task('watch', function () {
    //手动先运行一次
    gulp.run("default");

    var watcher = gulp.watch("src/**", ['default']);
    watcher.on('change', function (e) {
        console.warn('File ' + e.path + ' was ' + e.type + ', running tasks...');
    });
});

