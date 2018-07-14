let gulp = require("gulp");
let browserSync = require("browser-sync").create();
let connectSsi = require("connect-ssi");

gulp.task("browser-sync", () => {
    browserSync.init({
        server: {
            baseDir: "src",
            index: "index.html",
            middleware: [
                connectSsi({
                    baseDir: "src",
                    ext: ".html"
                })
            ]
        }
    });
});

gulp.task("bs-reload", () => {
    browserSync.reload();
});

gulp.task("default", gulp.task("browser-sync"), () => {
    gulp.watch("src/*.html", gulp.task("bs-reload"));
    gulp.watch("src/*.css", gulp.task("bs-reload"));
    gulp.watch("src/*.js", gulp.task("bs-reload"));
});