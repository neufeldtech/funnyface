var express = require('express');
var fs = require('fs');
var app = express();
require('../app')(app);
var supertest = require('supertest')(app)

describe('Routes', function() {
  describe('GET /', function() {
    it('responds with json message', function(done) {
      supertest.get('/')
      .expect(200)
      .expect({
        ok: true,
        message: 'send a multipart/form post with an image as the \'file\' parameter.'
      }, done)
    });
  })

  describe('POST /upload', function() {

    context('on success', function() {
      it('responds with image', function(done) {
        supertest.post('/upload')
          .attach('file', __dirname + '/img/boy_960x640.jpg')
          .expect('Content-Type', /image/)
          .expect(200, done)
      });
    });

    context('on success with helmet param', function() {
      it('responds with image', function(done) {
        supertest.post('/upload?s=helmet')
          .attach('file', __dirname + '/img/boy_960x640.jpg')
          .expect('Content-Type', /image/)
          .expect(200, done)
      });
    });

    context('on failure to find any faces', function(done) {
      it('responds with original image (albeit resized)', function(done) {
        supertest.post('/upload')
        .attach('file', __dirname + '/img/blue_slate.png')
        .expect('Content-Type', /image/)
        .expect(200, done)
      });
    });


    context('on failure due to undersized source image', function(done) {
      it('responds with json error message', function(done) {
        supertest.post('/upload')
        .attach('file', __dirname + '/img/boy_400x267.jpg')
        .expect('Content-Type', /json/)
        .expect(400,{
          ok: false,
          message: "Image must be at least 500 x 300 pixels"
        }, done)
      });
    });

      context('on failure due to sending wrong parameter name', function(done) {
        it('responds with json error message', function(done) {
          supertest.post('/upload')
          .attach('wrongnamebro', __dirname + '/img/boy_960x640.jpg')
          .expect('Content-Type', /json/)
          .expect(400,{
            ok: false,
            message: "send a multipart/form post with an image as the \'file\' parameter."
          }, done)
        });
      });

      context('on failure due to no image sent with file parameter', function(done) {
        it('responds with json error message', function(done) {
          supertest.post('/upload')
          .field('file', '')
          .expect('Content-Type', /json/)
          .expect(400,{
            ok: false,
            message: "no image specified for \'file\' parameter"
          }, done)
        });
      });

      context('on failure due to wrong mime type', function(done) {
        it('responds with json error message', function(done) {
          supertest.post('/upload')
          .attach('file', __dirname + '/img/bogus.txt')
          .expect('Content-Type', /json/)
          .expect(400,{
            ok: false,
            message: "Invalid file - please upload an image (.jpg, .png, .gif)."
          }, done)
        });
      });

  }); //end POST /upload

  describe('POST /api/v1/image', function() {

    context('on success', function() {
      it('responds with image', function(done) {
        supertest.post('/api/v1/image')
          .attach('file', __dirname + '/img/boy_960x640.jpg')
          .expect('Content-Type', /image/)
          .expect(200, done)
      });
    });

    context('on success with helmet param', function() {
      it('responds with image', function(done) {
        supertest.post('/api/v1/image?template=helmet')
          .attach('file', __dirname + '/img/boy_960x640.jpg')
          .expect('Content-Type', /image/)
          .expect(200, done)
      });
    });

    context('on failure to find any faces', function(done) {
      it('responds with original image (albeit resized)', function(done) {
        supertest.post('/api/v1/image')
        .attach('file', __dirname + '/img/blue_slate.png')
        .expect('Content-Type', /image/)
        .expect(200, done)
      });
    });


    context('on failure due to undersized source image', function(done) {
      it('responds with json error message', function(done) {
        supertest.post('/api/v1/image')
        .attach('file', __dirname + '/img/boy_400x267.jpg')
        .expect('Content-Type', /json/)
        .expect(400,{
          ok: false,
          message: "Image must be at least 500 x 300 pixels"
        }, done)
      });
    });

      context('on failure due to sending wrong parameter name', function(done) {
        it('responds with json error message', function(done) {
          supertest.post('/api/v1/image')
          .attach('wrongnamebro', __dirname + '/img/boy_960x640.jpg')
          .expect('Content-Type', /json/)
          .expect(400,{
            ok: false,
            message: "send a multipart/form post with an image as the \'file\' parameter."
          }, done)
        });
      });

      context('on failure due to no image sent with file parameter', function(done) {
        it('responds with json error message', function(done) {
          supertest.post('/api/v1/image')
          .field('file', '')
          .expect('Content-Type', /json/)
          .expect(400,{
            ok: false,
            message: "no image specified for \'file\' parameter"
          }, done)
        });
      });

      context('on failure due to wrong mime type', function(done) {
        it('responds with json error message', function(done) {
          supertest.post('/api/v1/image')
          .attach('file', __dirname + '/img/bogus.txt')
          .expect('Content-Type', /json/)
          .expect(400,{
            ok: false,
            message: "Invalid file - please upload an image (.jpg, .png, .gif)."
          }, done)
        });
      });

  }); //end POST /api/v1/image

  describe("GET /api/v1/image", function() {

    context("on success (default)", function() {
      it("should return image", function(done) {
        supertest.get('/api/v1/image?url=https://raw.githubusercontent.com/neufeldtech/funnyface/master/docs/img/barack.jpg')
          .expect('Content-Type', /image/)
          .expect(200, done)
      })
    })// end on success

    context("on success (with specified template)", function() {
      it("should return image", function(done) {
        supertest.get('/api/v1/image?template=helmet&url=https://raw.githubusercontent.com/neufeldtech/funnyface/master/docs/img/barack.jpg')
          .expect('Content-Type', /image/)
          .expect(200, done)
      })
    })// end on success with specified template

    context("on failure due to image too small", function() {
      it("should return appropriate error message", function(done) {
        supertest.get('/api/v1/image?template=helmet&url=https://raw.githubusercontent.com/neufeldtech/funnyface/master/test/img/boy_400x267.jpg')
          .expect('Content-Type', /application\/json/)
          .expect(400, {ok: false, message:"Image must be at least 500 x 300 pixels"}, done)
      })
    })// end on failure due to image too small

    context("on failure due to image 404", function() {
      it("should return appropriate error message", function(done) {
        supertest.get('/api/v1/image?template=helmet&url=https://raw.githubusercontent.com/neufeldtech/funnyface/master/test/img/yolo_this_is_a_404.png')
          .expect('Content-Type', /application\/json/)
          .expect(400, {ok: false, message:"Error: Image not found or unsupported image type."}, done)
      })
    })// end on failure due to image 404ing

  }) //end GET /api/v1/image
  describe("GET /help", function() {
    it("should return help doc", function(done) {
      supertest.get('/help')
        .expect(200, done)
    })
  })

  describe("GET /api/v1/templates", function() {
    it("should return help doc", function(done) {
      supertest.get('/api/v1/templates')
        .expect(200, done)
    })
  })

  describe("GET /api/v1/version", function() {
    it("should return package.json", function(done) {
      supertest.get('/api/v1/version')
        .expect('Content-Type', /application\/json/)
        .expect(200, done)
    })
  })
}); //end ROUTES
