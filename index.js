var fs = require('fs-extra');
var multer = require('multer');
var rmdir = require('rimraf');
var decompress = require('decompress');
var fstream = require('fstream');
var spawn = require('child_process').spawn;
var webBridge = require('clockwork-web-bridge');
var walk = require('walk');
var path = require('path');

function build(path, outPath) {
    return new Promise(function (resolve, reject) {
        webBridge(path, outPath).then(function (folderName) {
            //Copy template
            fs.renameSync(folderName, folderName + "#content");
            fs.copySync(__dirname + "/template", folderName);
            fs.copySync(folderName + "#content", folderName + "/ClockworkUWPTemplate/game");
            //Replace platform utils
            fs.copySync(__dirname + "/template/ClockworkUWPTemplate/game/clockwork/platformUtil.js", folderName + "/ClockworkUWPTemplate/game/clockwork/platformUtil.js");
            //Replace runtime polyfill
            var RTpolyfill = fs.readFileSync(folderName + "/ClockworkUWPTemplate/game/clockwork/RTpolyfill.js", 'utf-8');
            var RTpolyfillForUWP = fs.readFileSync(__dirname +"/template/ClockworkUWPTemplate/game/clockwork/RTpolyfill.js", 'utf-8');
            RTpolyfill = RTpolyfill.replace(/CLOCKWORKRT.API.appPath([^]*)$/, RTpolyfillForUWP);
            fs.writeFileSync(folderName + "/ClockworkUWPTemplate/game/clockwork/RTpolyfill.js", RTpolyfill, 'utf-8');
            //Clean
            fs.removeSync(folderName + "#content");
            //UWP project
            console.log("Creating .jsconfig");
            var jsproj = fs.readFileSync(folderName + "/ClockworkUWPTemplate/ClockworkUWPTemplate.jsproj", 'utf-8');
            var files = "";
            var listener = {
                listeners: {
                    names: function (root, nodeNamesArray) {
                        nodeNamesArray.sort(function (a, b) {
                            if (a > b) return 1;
                            if (a < b) return -1;
                            return 0;
                        });
                    }
                    , directories: function (root, dirStatsArray, next) {
                        next();
                    },
                    file: function (root, fileStats, next) {
                        var relativePath = (root.replace(/\\/g,"/") +"/" +fileStats.name).replace(folderName + "/ClockworkUWPTemplate/", "");
                        files += '    <Content Include="' + relativePath + '" />\n';
                        next();
                    }, errors: function (root, nodeStatsArray, next) {
                        next();
                    }
                }
            };
            walk.walkSync(folderName + "/ClockworkUWPTemplate/game", listener);
            jsproj = jsproj.replace("<!--GAME FILES-->", files);
            fs.writeFileSync(folderName + "/ClockworkUWPTemplate/ClockworkUWPTemplate.jsproj", jsproj, 'utf-8');
            resolve();
        });
    });
}


module.exports = build;
if (require.main === module) {
    var userArguments = process.argv.slice(2);
    if (userArguments.length == 1) {
        build(userArguments[0], "");
    }
}