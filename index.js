/**
 * Simple example Node.js application to demonstrate face detection.
 */

/**
 * Define the dependencies
 */
var express   =   require( 'express' )
  , http       =    require( 'http' )
  , async     =    require( 'async' )
  , multer    =   require( 'multer' )
  , upload     =    multer( { dest: 'uploads/' } )
  , easyimg   =    require( 'easyimage' )
  , _         =    require( 'lodash' )
  , cv         =   require( 'opencv' );

/**
 * Create a simple hash of MIME types to file extensions
 */
var helmetPath = __dirname + '/public/helmet-large-transparent-med.png'
var exts = {
  'image/jpeg'   :   '.jpg',
  'image/png'    :   '.png',
  'image/gif'    :   '.gif'
}

/**
 * Note that you may want to change this, depending on your setup.
 */
var port = process.env.NODE_PORT || 8080;

/**
 * Create the express app
 */
var app = express();

/**
 * Set up the public directory
 */
app.use(express.static(__dirname + '/public'))

/**
 * Set up Handlebars templating
 */


/**
 * Default page; simply renders a file upload form
 */
app.get('/', function( req, res, next ) {

  return res.json({ ok: true });

});

/**
 * POST callback for the file upload form. This is where the magic happens.
 */
app.post('/upload', upload.single('file'), function(req, res, next){

  // Generate a filename; just use the one generated for us, plus the appropriate extension
  var filename = req.file.filename + exts[req.file.mimetype]
    // and source and destination filepaths
    , src = __dirname + '/' + req.file.path
    , dst = __dirname + '/public/images/' + filename;

  /**
   * Go through the various steps
   */
  async.waterfall(
    [
      function( callback ) {

        /**
         * Check the mimetype to ensure the uploaded file is an image
         */
        if (!_.contains(
          [
            'image/jpeg',
            'image/png',
            'image/gif'
          ],
          req.file.mimetype
        ) ) {

          return callback( new Error( 'Invalid file - please upload an image (.jpg, .png, .gif).' ) )

        }

        return callback();

      },
      function( callback ) {

        /**
         * Get some information about the uploaded file
         */
        easyimg.info( src ).then(

          function(file) {

            /**
             * Check that the image is suitably large
             */
            if ( ( file.width < 960 ) || ( file.height < 300 ) ) {

              return callback( new Error( 'Image must be at least 640 x 300 pixels' ) );

            }

            return callback();
          }
        );
      },
      function( callback ) {

        /**
         * Resize the image to a sensible size
         */
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

        /**
         * Use OpenCV to read the (resized) image
         */
        cv.readImage( dst, callback );

      },
      function( im, callback ) {

        /**
         * Run the face detection algorithm
         */
        im.detectObject( cv.FACE_CASCADE, {}, callback );

      },
      function(faces, callback) {
        if (faces.length == 0)
          return callback("no faces found")
        var command = []
        command.push("convert", dst)
        _.each(faces, function (face) {
          console.log("found a face");
          var helmetWidth = face.width * 1.95
          var helmetHeight = face.height * 1.95
          var xOffset = face.x - face.width * 0.25
          var yOffset = face.y - face.height * 0.6
          var geometry = helmetWidth + "x" + helmetHeight + "+" + xOffset + "+" + yOffset
          command.push(helmetPath, "-geometry", geometry , "-composite")
        });
        command.push("output.jpg")
        //command.push("convert", src, helmetPath, helmetWidth + "x" + helmetHeight + "+" + xOffset + "+" + yOffset, "-composite", "output.png")
        easyimg.exec(command.join(' '))
        callback(null, faces)
      }

    ],
    function( err, faces ) {

      /**
       * If an error occurred somewhere along the way, render the
       * error page.
       */
      if ( err ) {

        return res.json({ ok: false, message: err });
      }

      /**
       * We're all good; render the result page.
       */
      return res.json({ faces: faces });

    }
  );

});

/**
 * Start the server
 */
http.createServer(
  app
).listen( port, function( server ) {
  console.log( 'Listening on port %d', port );
});
