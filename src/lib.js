var fs         = require('fs')
var easyimg    = require('easyimage')
var _          = require('lodash')
var cv         = require('opencv')
var temp       = require('temp')
var request    = require('request')
var exec       = require('child_process').exec
var async      = require('async')

module.exports = function(){
  var lib = {}
  lib.exts = {
    'image/jpeg'   :   '.jpg',
    'image/png'    :   '.png',
    'image/gif'    :   '.gif'
  }
  lib.nukeFile = function(filePath, cb) {
    if (filePath) {
      fs.exists(filePath, function(exists) {
        if (exists) {
          fs.unlink(filePath, function(err){
            if (err) {
              return cb(err)
            } else {
              return cb(null)
            }
          });
        } else {
          return cb('file did not exist')
        }
      });
    } else {
      return cb('file path is null')
    }
  }

  lib.downloadImage = function(url, cb) {
    var r = request.get(url)
    r.on('error', function(err) {
      return cb("There was an error downloading the image: " + err)
    })
    r.on('response', function(response){
      if (response.statusCode != 200 || !_.includes(['image/jpeg','image/png','image/gif'], response.headers['content-type'])) {
        return cb("Error: Image not found or unsupported image type.")
      }
      var imgPath = temp.path({suffix: lib.exts[response.headers['content-type']]})
      r.pipe(stream = fs.createWriteStream(imgPath))
      stream.on('finish', function(){
        return cb(null, imgPath)
      });
    });
  }

  lib.applyStencil = function(src, stencil) {
    async.waterfall(
      [
        function( src, dst, callback ) {
          easyimg.info( src ).then(
            function(file) {
              if ( ( file.width < 500 ) || ( file.height < 300 ) ) {
                return callback('Image must be at least 500 x 300 pixels');
              }
              return callback();
            }
          );
        },
        function( callback ) {
          easyimg.resize(
            {
              width      :   960,
              src        :   src,
              dst        :   dst
            }
          ).then(function(image) {
            return callback();
          });
        },
        function( callback ) {
          cv.readImage( dst, callback );
        },
        function( im, callback ) {
          im.detectObject( cv.FACE_CASCADE_ALT2, {

          }, callback );
        },
        function(faces, callback) {
          if (faces.length == 0) {
            return callback(null, dst)
          }
          var command = []
          var outputFileName = temp.path({suffix: '.jpg'});
          command.push("convert", dst)

          _.each(faces, function (face) {
            if (req.query.s == "helmet") {
              // helmet settings
              var stencilWidth = face.width * 1.95
              var stencilHeight = face.height * 1.95
              var xOffset = face.x + face.width * -0.28
              var yOffset = face.y + face.height * -0.6
              var stencilPath = __dirname + '/templates/helmet.png'
            } else {
              //default to moustache settings
              var stencilWidth = face.width * 0.8
              var stencilHeight = face.height * 0.8
              var xOffset = face.x + face.width * 0.1
              var yOffset = face.y + face.height * 0.58
              var stencilPath = __dirname + '/templates/mustache.png'
            }
            var geometry = stencilWidth + "x" + stencilHeight + "+" + xOffset + "+" + yOffset
            command.push(stencilPath, "-geometry", geometry , "-composite")
          });
          command.push(outputFileName)
          exec(command.join(' '), function(err, stdout, stderr) {
            if (err) {
              console.error(err);
              return callback('Error processing file')
            }
            return callback(null, outputFileName)
          })
        }
      ],
      function( err, outputFileName ) {
        if ( err ) {
          lib.nukeFile(src)
          lib.nukeFile(dst)
          return res.status(400).json({ ok: false, message: err });
        }
        return res.sendFile(outputFileName, function(err){
          lib.nukeFile(src)
          lib.nukeFile(dst)
          lib.nukeFile(outputFileName)
        });
      }
    );
  }

 return lib;
}
