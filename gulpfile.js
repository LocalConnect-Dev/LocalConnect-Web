let gulp = require("gulp");
let browserSync = require("browser-sync").create();

gulp.task("browser-sync", () => {
    browserSync.init({
        server: {
            baseDir: "src",
            index: "index.html"
        }
    });
});

gulp.task("bs-reload", () => {
    browserSync.reload();
});

gulp.task("default", ["browser-sync"], () => {
    gulp.watch("src/*.html", ["bs-reload"]);
    gulp.watch("src/*.css", ["bs-reload"]);
    gulp.watch("src/*.js", ["bs-reload"]);
});