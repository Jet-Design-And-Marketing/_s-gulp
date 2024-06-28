const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const browserSync = require("browser-sync").create();
const autoprefixer = require("gulp-autoprefixer");
const babel = require("gulp-babel");
const cleanCSS = require("gulp-clean-css");
const rename = require("gulp-rename");
const include = require("gulp-include");
const sassGlob = require("gulp-sass-glob");
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify-es").default;
const notifier = require("node-notifier");
const isLocal = process.argv.includes("--local");
sass.compiler = require("sass");
const fs = require("fs");
const package = JSON.parse(fs.readFileSync("./package.json"));

function styles() {
  let stream =
    // Take our input.
    gulp
      .src("styles/main.scss")

      // Initalise our source maps.
      .pipe(sourcemaps.init())

      // Glob the files.
      .pipe(sassGlob())

      // Run it through SASS.
      .pipe(
        sass({
          includePaths: ["node_modules"],
          outputStyle: "compressed",
        })
      )
      .on("error", swallowError)

      // Autoprefix it.
      .pipe(autoprefixer())
      .on("error", swallowError)

      // Minify the CSS.
      .pipe(
        cleanCSS({
          level: {
            1: { specialComments: 0 },
            2: { removeDuplicateRules: true },
          },
        })
      )
      .on("error", swallowError);

  // Write the source maps if we are working locally.
  if (isLocal) {
    stream.pipe(sourcemaps.write());
  }

  // Suffix our file with ".min".
  stream
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .on("error", swallowError)

    // Output the CSS to the "dist" folder.
    .pipe(gulp.dest("dist"));

  // If we're working locally, stream to BrowserSync.
  if (isLocal) {
    stream.pipe(browserSync.stream());
  }

  return stream;
}

/**
 * Run our scripts through Babel & uglify
 * and then output them to the "dist" folder.
 */
function scripts() {
  let stream =
    // Take our input.
    gulp
      .src("js/main.js")

      // Run it through Babel.
      .pipe(
        babel({
          presets: ["@babel/env"],
        })
      )
      .on("error", swallowError)

      // Include any required scripts.
      .pipe(
        include({
          includePaths: ["node_modules"],
        })
      )
      .on("error", swallowError)

      // Minify it.
      .pipe(uglify())
      .on("error", swallowError)

      // Suffix our fil with ".min".
      .pipe(
        rename({
          suffix: ".min",
        })
      )
      .on("error", swallowError)

      // Output the JS to the "dist" folder.
      .pipe(gulp.dest("dist"));

  // If we're working locally, reload to see the changes.
  if (isLocal) {
    stream.pipe(
      browserSync.reload({
        stream: true,
      })
    );
  }

  return stream;
}

/**
 * Setup BrowserSync.
 */
function bsync() {
  browserSync.init({
    watch: false,
    injectChanges: false,
    proxy: package.vhost,
  });
}

/**
 * Setup file watching.
 */
function watch() {
  // Run the "styles" task whenever we see any ".scss" files update.
  gulp.watch("styles/**/*.scss", styles);

  // Run the "scripts" task whenever we see any ".js" files update.
  gulp.watch("js/**/*.js", scripts);

  // Run the "reload" task whenever we see any ".php" files update.
  gulp.watch("**/*.php", reload);
}

/**
 * Reload the page with BrowserSync.
 */
function reload(done) {
  browserSync.reload();

  if (done) {
    done();
  }
}

/**
 * Prevent errors from causing NPM to quit,
 * instead notify us with the error.
 */
function swallowError(error) {
  notifier.notify({
    title: "Error:",
    message: error.toString(),
  });

  console.error(error.toString());

  this.emit("end");
}

// Export our gulp functions.

exports.styles = styles;
exports.scripts = scripts;
exports.bsync = bsync;
exports.watch = watch;
exports.reload = reload;

const serve = isLocal
  ? gulp.series(styles, scripts, bsync)
  : gulp.series(styles, scripts);
const def = gulp.parallel(serve, watch);

exports.default = def;
