import gulp from 'gulp';
import marked from 'marked';
import sass from 'sass';
import sassGulp from 'gulp-sass';
import rename from 'gulp-rename';
import through2 from 'through2';
import concat from 'gulp-concat';
import uglifycss from 'gulp-uglifycss';
import copy from 'gulp-copy';
import flatten from 'gulp-flatten';
import fs from 'fs';

// Sassify this stuff
const Sassify = sassGulp(sass);

// Task to convert markdown to HTML and apply custom styling
gulp.task('markdown-to-html', () => {
  return gulp.src('src/markdowns/**/*.md')
    .pipe(markdownToHtml())
    .pipe(rename({ extname: '.html' }))
    .pipe(gulp.dest('www'));
});

// Task to compile Sass to CSS
gulp.task('compile-sass', () => {
  return gulp.src('src/styles/global.scss')
    .pipe(Sassify())
    .pipe(concat('styles.css'))
    .pipe(gulp.dest('www'))
    .pipe(uglifycss({"maxLineLen": 80, "uglyComments": true }));
});



// Function to convert markdown to HTML using marked
function markdownToHtml() {
  return through2.obj((file, _, cb) => {
    if (file.isBuffer()) {
        const sourceContainer = fs.readFileSync('src/statics/index.html', 'utf8');
        const markdownContent = file.contents.toString('utf-8');
        const htmlContent = marked.parse(markdownContent) as string;
        file.contents = Buffer.from(sourceContainer.replace('{{markdown}}', htmlContent));
    }
    cb(null, file);
  });
}

// Task to copy assets from node_modules to the destination
gulp.task('copy-assets', () => {
  return gulp.src('node_modules/@fontsource/*/files/**/*')
    .pipe(flatten())
    .pipe(gulp.dest('www/files'))
});


// Watching tasks
gulp.task('watch-markdown', () => gulp.watch('src/markdowns/**/*.md', gulp.series(['markdown-to-html'])));
gulp.task('watch-scss', () => gulp.watch('src/styles/**/*.scss', gulp.series(['compile-sass'])));
gulp.task('watch-statics', () => gulp.watch('src/statics/**/*', gulp.series(['markdown-to-html'])));

// Default task
gulp.task('default', gulp.series(
  'markdown-to-html', 
  'compile-sass',
  'copy-assets'
));

// Watch for changes
gulp.task('watch', gulp.parallel([
  'default',
  'watch-markdown',
  'watch-scss',
  'watch-statics',
]));
