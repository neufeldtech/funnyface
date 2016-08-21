var lib = require('../src/lib')();
var temp = require('temp')
var fs = require('fs')
var expect = require('chai').expect

describe("lib", function() {
  describe(".nukeFile", function() {

    context("on success", function() {
      var mockFs = require('mock-fs')
      var tempFile = "/path/to/temp/dir/fakeFile.txt"
      beforeEach(function() {
        mockFs({
          '/path/to/temp/dir': {
            'fakeFile.txt': 'file content here'
          }
        });
      });
      afterEach(function() {
        mockFs.restore()
      });
      it("should successfully delete file", function(done) {
        lib.nukeFile(tempFile, function(err) {
          expect(err).to.not.exist
          done()
        })
      });

    })//end on successs

    context("on failure due to file not existing", function() {
      var tempFile = "/path/to/temp/dir/thisFileDoesNotExist.txt"
      it("should successfully return error message", function(done) {
        lib.nukeFile(tempFile, function(err) {
          expect(err).to.match(/file did not exist/)
          done()
        })
      });

    })//end on failure due to file not exist

    context("on failure due to null path", function() {
      var tempFile = null
      it("should successfully return error message", function(done) {
        lib.nukeFile(tempFile, function(err) {
          expect(err).to.match(/file path is null/)
          done()
        })
      });

    })//end on failure due to null path

    context("on failure due to fs.unlink err", function() {
      var mockFs = require('mock-fs')
      var tempFile = "/path/to/temp/dir"
      beforeEach(function() {
        mockFs({
          '/path/to/temp/dir': {
            'fakeFile2.txt': mockFs.file({
            })
          }
        });
      });
      afterEach(function() {
        mockFs.restore()
      });
      it("should return error message from fs.unlink", function(done) {
        lib.nukeFile(tempFile, function(err) {
          expect(err).to.exist
          done()
        })
      });

    })//end on failure due to fs.unlink err

  })// end .nukeFile

  describe(".downloadImage", function() {

    context("on success", function() {

      beforeEach(function() {
        nock = require('nock')
        nock.cleanAll()
        nock.disableNetConnect()
        nock('http://images.test')
          .get('/get/image/blue_slate.png')
          .reply(200, function(uri, requestBody) {
            return fs.createReadStream(__dirname + '/img/blue_slate.png');
          }, {"content-type": "image/png"});
        });

      afterEach(function() {
        nock.cleanAll()
        nock.enableNetConnect()
      })

      it("should return temp path to file", function(done) {
        lib.downloadImage("http://images.test/get/image/blue_slate.png", function(err, path) {
          expect(err).to.not.exist
          expect(path).to.match(/.*\.png/)
          done()
        })
      })
    })//end on success

    context("on failure due to request err", function() {

      beforeEach(function() {
        nock = require('nock')
        nock.cleanAll()
        nock.disableNetConnect()
        nock('http://images.test')
          .get('/get/image/blue_slate.png')
          .replyWithError("Oops, the TCP stack blew up")
        });

      afterEach(function() {
        nock.cleanAll()
        nock.enableNetConnect()
      })

      it("should return err mesage", function(done) {
        lib.downloadImage("http://images.test/get/image/blue_slate.png", function(err, path) {
          expect(err).to.match(/There was an error downloading the image\:/)
          expect(path).to.not.exist
          done()
        })
      })
    })//end on failure due to request err

    context("on failure due to HTTP 404", function() {

      beforeEach(function() {
        nock = require('nock')
        nock.cleanAll()
        nock.disableNetConnect()
        nock('http://images.test')
          .get('/get/image/blue_slate.png')
          .reply(404, { message: "bro do you even internet" })
        });

      afterEach(function() {
        nock.cleanAll()
        nock.enableNetConnect()
      })

      it("should return err mesage", function(done) {
        lib.downloadImage("http://images.test/get/image/blue_slate.png", function(err, path) {
          expect(err).to.match(/Error\: Image not found or unsupported image type/)
          expect(path).to.not.exist
          done()
        })
      })
    })//end on failure due to request err

  })//end .downloadImage

}) //end lib
