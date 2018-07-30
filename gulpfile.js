let gulp = require("gulp");
let browserSync = require("browser-sync").create();

gulp.task("browser-sync", () => {
    browserSync.init({
        server: {
            baseDir: "src",
            index: "index.html",
        },
        middleware: (req, res, next) => {
            if (/^([0-9A-z\-/]+).view$/g.test(req.url)) {
                req.url = "/index.html";
            }

            return next();
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