var gulp = require("gulp");
var tsc = require("gulp-typescript");
var tslint = require("gulp-tslint");
var del = require("del");
var Path = require("path");
var merge = require("merge2");
var sourcemaps = require("gulp-sourcemaps");
var gulpNSP = require("gulp-nsp");

var outputFolder = "dist";

var tsProject = tsc.createProject("tsconfig.json", {rootDir: __dirname});

gulp.task("clean",function(){
	return del([outputFolder, "lib/**/*.d.ts", "lib/**/*.map", "lib/**/*.js"]);
});

gulp.task("compile", ["clean"], function() {
    var tsResult = tsProject.src().pipe(sourcemaps.init()).pipe(tsProject());
    var devOutFolder = ".";
    return merge([
        tsResult.dts.pipe(gulp.dest(devOutFolder)),
        tsResult.js.pipe(sourcemaps.write(devOutFolder, {
            sourceRoot: function(file){ return file.cwd; }
        })).pipe(gulp.dest(devOutFolder))
    ]);
});

gulp.task("copyLib", ["clean", "compile"], function () {
	var outputLibFolder = Path.join(outputFolder, "lib");
	return gulp.src(["lib/**/*.d.ts", "lib/**/*.js"]).pipe(gulp.dest(outputLibFolder));
});

gulp.task("copyMetaFiles", ["clean"], function () {
	return gulp.src(["package.json", "README.md"]).pipe(gulp.dest(outputFolder));
});

gulp.task("copyConfig", ["clean"], function () {
	var outputConfigFolder = Path.join(outputFolder, "config");
	return gulp.src("./config/**").pipe(gulp.dest(outputConfigFolder));
});

gulp.task("copyDistributables", ["copyLib", "copyMetaFiles", "copyConfig"]);

gulp.task("lint", function() {
    return gulp.src(["lib/**/*.ts", "!lib/**/*.d.ts"])
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report());
});

gulp.task("nsp", function (cb) {
  gulpNSP({
    package: __dirname + "/package.json",
    stopOnError: false
  }, cb);
});

// Default Task
gulp.task("default", ["clean", "nsp", "lint", "compile", "copyDistributables"]);
gulp.task("dev", ["default"]);
