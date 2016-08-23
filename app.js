var express      = require( 'express' )
var async        = require( 'async' )
var multer       = require( 'multer' )
var _            = require( 'lodash' )
var crypto       = require('crypto')
var mime         = require('mime')
var stencils     = require('./src/stencils')
var lib          = require('./src/lib')()

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './images/')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
    });
  }
});
var  upload       = multer( { storage: storage } ).single('file')


var exts = {
  'image/jpeg'   :   '.jpg',
  'image/png'    :   '.png',
  'image/gif'    :   '.gif'
}

module.exports = function(app) {
  app.get('/', function( req, res, next ) {

    return res.json({ ok: true, message: "send a multipart/form post with an image as the \'file\' parameter." });

  });
  //legacy upload route here
  app.post('/upload', function(req, res, next){
    upload(req, res, function(err) {
      if (err) {
        return res.status(400).json({ ok: false, message: "send a multipart/form post with an image as the \'file\' parameter." })
      }
      if (!req.file || !req.file.filename) {
        return res.status(400).json({ ok: false, message: "no image specified for \'file\' parameter" });
      }
      var src = __dirname + '/' + req.file.path
      if (!_.includes(['image/jpeg','image/png','image/gif'], req.file.mimetype)) {
        return res.status(400).json({ok: false, message: "Invalid file - please upload an image (.jpg, .png, .gif)."})
      }
      var stencil = "moustache"
      lib.applyStencil(src, stencil, function(err, fileName) {
        if (err) {
          res.status(400).json({ ok: false, message: err})
        } else {
          res.sendFile(fileName, function(err) {
            lib.nukeFile(src, function(err, msg) {

            })
            lib.nukeFile(fileName, function(err, msg) {

            })
          });
        }
      })//end applyStencil
    }); //end upload
  }); //end POST /upload

  //newer routes below
  app.post('/api/v1/image', function(req, res, next){
    upload(req, res, function(err) {
      if (err) {
        return res.status(400).json({ ok: false, message: "send a multipart/form post with an image as the \'file\' parameter." })
      }
      if (!req.file || !req.file.filename) {
        return res.status(400).json({ ok: false, message: "no image specified for \'file\' parameter" });
      }
      var src = __dirname + '/' + req.file.path
      if (!_.includes(['image/jpeg','image/png','image/gif'], req.file.mimetype)) {
        return res.status(400).json({ok: false, message: "Invalid file - please upload an image (.jpg, .png, .gif)."})
      }
      var stencil = req.query.template
      lib.applyStencil(src, stencil, function(err, fileName) {
        if (err) {
          res.status(400).json({ ok: false, message: err})
        } else {
          res.sendFile(fileName, function(err) {
            lib.nukeFile(src, function(err, msg) {})
            lib.nukeFile(fileName, function(err, msg) {})
          });
        }
      })//end applyStencil
    }); //end upload
  }); //end POST /upload

  app.get('/api/v1/image', function(req, res, next){
    var stencil = req.query.template
    var url = req.query.url
    var src = ""
    async.waterfall(
      [
        function(callback) {
          lib.downloadImage(url, function(err, fileName) {
            if (err) {
              return callback(err)
            } else {
              src = fileName;
              return callback(null, src)
            }
          })
        },
        function(fileName, callback) {
          lib.applyStencil(fileName, stencil, function(err, finalFilename) {
            if (err) {
              return callback(err)
            } else {
              return callback(null, finalFilename)
            }
          })
        }
      ],
      function(err, result) {
        if (err) {
          res.status(400).json({ ok: false, message: err })
        } else {
          res.sendFile(result, function(err){
            lib.nukeFile(src, function(err, msg) {});
            lib.nukeFile(result, function(err, msg) {});
          });
        }
      }
    )//end async waterfall
  }); //end GET /url

  app.get(/h(a|e)lp/, function(req,res) {
    res.json({ ok: true, message: "For assistance, visit https://github.com/neufeldtech/funnyface" })
  })

  app.get('/api/v1/templates', function(req,res) {
    res.json({ ok: true, message: stencils })
  })

  app.get('/api/v1/version', function(req,res) {
    res.sendFile(__dirname + '/package.json')
  })

}
