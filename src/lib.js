var fs         = require('fs')
var easyimg    = require('easyimage')
var _          = require('lodash')
var cv         = require('opencv')
var temp       = require('temp')
var request    = require('request')
var exec       = require('child_process').exec
var async      = require('async')
var stencils   = require('./stencils')

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
    var urlTest = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(url);
    if (! urlTest) {
      return cb('Error: invalid image URL')
    }
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

  lib.applyStencil = function(src, stencil, cb) {
    var extension = src.slice((src.lastIndexOf(".") - 1 >>> 0) + 2);
    var rootFileName = src.replace(/\.[^/.]+$/, "");
    var dst = rootFileName + "-resized." + extension;
    async.waterfall(
      [
        function( callback ) {
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
          im.detectObject( cv.FACE_CASCADE_ALT2, {}, callback );
        },
        function(faces, callback) {
          if (faces.length == 0) {
            return callback(null, dst)
          }
          var command = []
          var outputFileName = temp.path({suffix: '.jpg'});
          command.push("convert", dst)

          _.each(faces, function (face) {
            var stencilProps = ""
            if (stencils[stencil]){
              stencilProps = stencils[stencil]
            } else { //default to moustache
              stencilProps = stencils["moustache"]
            }
            var stencilWidth = face.width * stencilProps.xScaleFactor
            var stencilHeight = face.height * stencilProps.yScaleFactor
            var xOffset = face.x + face.width * stencilProps.xOffset
            var yOffset = face.y + face.height * stencilProps.yOffset
            var stencilPath = __dirname + '/templates/' + stencilProps.fileName
            var geometry = stencilWidth + "x" + stencilHeight + "+" + xOffset + "+" + yOffset
            command.push(stencilPath, "-geometry", geometry , "-composite")
          });
          command.push(outputFileName)
          exec(command.join(' '), function(err, stdout, stderr) {
            if (err) {
              return callback('Error processing file')
            }
            return callback(null, outputFileName)
          })
        }
      ], cb); //end waterfall
  } //end applyStencil

 return lib;
}
