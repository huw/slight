var
    fs = require('fs'),
    lwip = require('lwip'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    nsg = require('node-sprite-generator')
    async = require('async'),
    maxworkers = require('os').cpus().length,
    stylus = require('stylus'),
    sqwish = require('sqwish'),
    clipboard = require('copy-paste'),
    minimist = require('minimist');

var args = minimist(process.argv.slice(2))._

function resize(cb) {
    // Create the destination folder
    mkdirp('./flairs/resized', function(err) {
        fs.readdir('./flairs', function(err, files) {
            if (err) throw err

            // Async magic!
            async.eachSeries(files, function(file, callback) {
                resizeimg({
                    src: path.join('./flairs', '/', file),
                    dest: './flairs/resized',
                    file: file
                }, callback)
            }, function(err) {
                if (err) throw err
                console.log("All images resized")

                if (cb) {
                    cb()
                }
            })
        });
    });
}

function resizeimg(params, callback) {
    var re = /(.+?)(\.[^.]*$|$)/;
    var filename = re.exec(params.file);

    // Only resize image files (.DS_Store usually shows up here)
    if (filename[2] == ".jpg" || filename[2] == ".png") {
        lwip.open(params.src, function(err, image) {
            if (err) throw err

            // Size based on aspect ratios
            // The program will automatically resize to the largest of the
            // dimensions. If the image is really wide, though, then we want
            // to make it a little smaller to reduce its size.
            var aspect = image.width() / image.height()
            var width = 84
            var height = 36
            if (aspect >= 7/3) {
                width = 200
                height = 28
            }

            var scale = Math.min(width / image.width(), height / image.height())
            asyncTasks = []

            image.batch().scale(scale).writeFile(params.dest + '/' + params.file, function(err) {
                if (err) throw err
                callback()
            })
        });
    } else {
        callback(null)
    }
}

function makeNormal(callback) {
    nsg({
        src: ['./flairs/resized/*'],
        spritePath: './images/flairsheet.png',
        stylesheet: 'prefixed-css',
        stylesheetPath: './styles/flairs.css',
        stylesheetOptions: {
            prefix: 'flair-',
            spritePath: '%%flairsheet%%',
            pixelRatio: 2
        },
        layout: 'packed',
        layoutOptions: {
            padding: 4
        }
    }, function(err) {
        if (err) throw err
        console.log("Spritesheets created")
        fs.readFile('./styles/flairs.css', 'utf8', function (err,data) {
            if (err) throw err
            // Minify the resulting sprite css. It's big and repetitive.
            // Taking everything past the 76th character will remove the
            // useless first line (already handled, thx very much)
            var result = sqwish.minify(data).substring(76)

            fs.writeFile('./styles/flairs.css', result, 'utf8', function (err) {
                if (err) throw err
                console.log("Minified flair styling")
                if (callback) {
                    callback()
                }
            });
        });
    });
}

function renderStyles() {
    fs.readFile('./slight.styl', 'utf8', function(err, data) {
        if (err) throw err
        stylus.render(data, function(err, css) {
            if (err) throw err
            fs.readFile('./styles/flairs.css', 'utf8', function (err, data) {
                
                var compiled
                if (err && err.code == 'ENOENT') {
                    compiled = css
                } else if (err) {
                    throw err
                } else {
                    compiled = css + '\n' + data
                }
                console.log("Compiled stylesheet")

                fs.writeFile('./output.css', compiled, 'utf8', function(err) {
                    if (err) throw err
                })

                clipboard.copy(compiled)
                console.log("Copied to clipboard")
            });
        })
    })
}

fs.open('./flairs', 'r', function(err, data) {
    // Will error if there's nothing in '/flairs'
    if (err && err.code == 'ENOENT') {
        renderStyles()
    } else if (args.indexOf('compile') == -1 && args.indexOf('resize') == -1 && args.indexOf('make-sheet') == -1) {
        // Do all functions
        resize(function(){
            makeSheet(function(){
                renderStyles()
            })
        })
    } else if (args.indexOf('resize') > -1) {
        resize()
    } else if (args.indexOf('make-sheet') > -1) {
        makeSheet()
    } else if (args.indexOf('compile') > -1) {
        renderStyles()
    }
});