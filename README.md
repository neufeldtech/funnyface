# FunnyFace

## Quick Start
##### Requires
- [Docker](https://www.docker.com/products/docker)

```
git clone https://github.com/neufeldtech/funnyface.git funnyface
docker build funnyface -t myapp
docker run -d -p 5000:8080 --restart always myapp
```
The app should be running now at http://localhost:5000

### Show me something awesome
From your local repository directory, we'll use ```curl``` to test out the app:
```
curl -F file=@docs/img/barack.jpg -o /tmp/barack-stache.jpg "http://localhost:5000/api/v1/image"
```

Upon success, you'll open up ```/tmp/barack-stache.jpg``` and get back something like this:

<img src="https://raw.githubusercontent.com/neufeldtech/funnyface/master/docs/img/barack-moustache.png" width="350px" />


### API

| Endpoint | Description | Query String Parameters | Form Parameters | Example |
| ---- | ---- | ---- | ---- | ---- |
| GET /api/v1/image | Attempts face detection and applies template image to each face | **url**: url to source image<br>**template**: (optional) template image to apply to face (see /help for templates) | N/A |```curl -o /tmp/output.jpg https://funnyface.neufeldtech.com/api/v1/image?template=helmet&url=https://raw.githubusercontent.com/neufeldtech/funnyface/master/docs/img/barack.jpg``` |
| POST /api/v1/image | Attempts face detection and applies template image to each face | **template**: (optional) template image to apply to face (see /help for templates) | **file**: Image to upload (jpg, png, or gif) | ```curl -F file=@docs/img/barack.jpg -o /tmp/barack-stache.jpg "https://funnyface.neufeldtech.com/api/v1/image?template=moustache"```|
| GET /api/v1/templates | Returns list of known templates | N/A | N/A | ```curl https://funnyface.neufeldtech.com/api/v1/templates``` |
| GET /api/v1/help | Returns link to this help doc| N/A | N/A | ```curl https://funnyface.neufeldtech.com/api/v1/help``` |

## Run it locally
##### Requires
- [Node.js v4.2.1](https://nodejs.org/en/)
- [OpenCV v2.4](http://opencv.org/downloads.html)
- [ImageMagick](http://www.imagemagick.org/script/binary-releases.php)

```
npm install
npm start
```

### Tests

**Note: tests are currently not fully mocked (You will need all dependencies  installed)**

- To run the tests:
```npm test ```

### Fact
The codebase for this app was originally forked from https://github.com/sitepoint-editors/face-detection-nodejs

### License
MIT
