var rmdir = require('rimraf');
rmdir("projects", function () {
    fs.mkdir("projects");
});
rmdir("uploads", function () {
    fs.mkdir("uploads");
});
var fs = require('fs');