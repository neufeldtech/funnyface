var express   =   require( 'express' )
var port = process.env.PORT || 8080;
var app = express();

require('./src/app')(app);

app.listen(port, function() {
  console.log('Server listening on port ' + this.address().port);
});
