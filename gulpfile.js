let gulp = require("gulp");
let browserSync = require("browser-sync").create();

gulp.task("browser-sync", () => {
    browserSync.init({
        server: {
            baseDir: "src",
            index: "index.html",
            middleware: [
                (req, res, next) => {
                    if (/^([0-9A-z\-/]+).view$/g.test(req.url)) {
                        req.url = "/index.html";
                    }

                    next();
                }
            ]
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