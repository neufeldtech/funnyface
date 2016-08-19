var fs = require('fs')
module.exports = function(){
  var lib = {}

  lib.nukeFile = function(filePath) {
    if (filePath) {
      fs.exists(filePath, function(exists) {
        if (exists) {
          fs.unlink(filePath, function(err){
            if (err) {
              console.log(err)
            }
          });
        }
      });
    }
  }

 return lib;
}
