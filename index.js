var express   =   require( 'express' )
  , http       =    require( 'http' )
  , async     =    require( 'async' )
  , multer    =   require( 'multer' )
  , upload     =    multer( { dest: 'uploads/' } ).single('file')
  , easyimg   =    require( 'easyimage' )
  , _         =    require( 'lodash' )
  , cv         =   require( 'opencv' )
  , temp       =   require( 'temp' )
  , fs         =   require( 'fs' )
  , exec      =    require('child_process').exec

var helmetPath = __dirname + '/public/helmet-large-transparent-med.png'
var exts = {
  'image/jpeg'   :   '.jpg',
  'image/png'    :   '.png',
  'image/gif'    :   '.gif'
}

var port = process.env.PORT || process.env.NODE_PORT || 8080;

function nukeFile(filePath){
  fs.exists(filePath, function(exists) {
    if (exists) {
      fs.unlink(filePath);
    }
  })
}

var app = express();

app.use(express.static(__dirname + '/public'))

app.get('/', function( req, res, next ) {

  return res.json({ ok: true, message: "send a multipart/form post with an image as the 'file' parameter." });

});

app.post('/upload', function(req, res, next){
  upload(req, res, function(err) {
    if (err) {
      return res.status(400).json({ ok: false, message: "send a multipart/form post with an image as the 'file' parameter." })
    }
    if (!req.file || !req.file.filename) {
      return res.status(400).json({ ok: false, message: "no image specified for 'file' parameter" });
    }
    var filename = req.file.filename + exts[req.file.mimetype]
    , src = __dirname + '/' + req.file.path
    , dst = __dirname + '/public/images/' + filename

    async.waterfall(
      [
        function( callback ) {
          if (!_.contains(
            [
              'image/jpeg',
              'image/png',
              'image/gif'
            ],
            req.file.mimetype
          ) ) {

            return callback('Invalid file - please upload an image (.jpg, .png, .gif).')

          }

          return callback();

        },
        function( callback ) {

          easyimg.info( src ).then(
            function(file) {

              if ( ( file.width < 960 ) || ( file.height < 300 ) ) {
                return callback('Image must be at least 960 x 300 pixels');
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

          im.detectObject( cv.FACE_CASCADE, {}, callback );

        },
        function(faces, callback) {
          if (faces.length == 0)
          return callback("no faces found")
          var command = []
          var outputFileName = temp.path({suffix: '.jpg'});
          command.push("convert", dst)
          _.each(faces, function (face) {
            var helmetWidth = face.width * 1.95
            var helmetHeight = face.height * 1.95
            var xOffset = face.x - face.width * 0.28
            var yOffset = face.y - face.height * 0.6
            var geometry = helmetWidth + "x" + helmetHeight + "+" + xOffset + "+" + yOffset
            command.push(helmetPath, "-geometry", geometry , "-composite")
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
          return res.status(500).json({ ok: false, message: err });
        }

        return res.sendFile(outputFileName, function(err){
          nukeFile(src)
          nukeFile(dst)
          nukeFile(outputFileName)
        });

      }
    );

  });

});

http.createServer(
  app
).listen( port, function( server ) {
  console.log( 'Listening on port %d', port );
});
