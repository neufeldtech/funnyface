# FunnyFace

## Quick Start
```
git clone https://github.com/neufeldtech/funnyface.git funnyface
docker build ../funnyface -t myApp:latest
docker run -d -p 5000:8080 --restart always myApp:latest
```
The app should be running now at http://localhost:5000

### Show me something awesome
- Go get [POSTMAN](http://www.getpostman.com/) (chrome extension for testing API's)
- Set up a POST to localhost:5000/upload with the form parameter **file** containing a face. (If you need a test image, find one in /docs/img/barack.jpg)
<img src="https://raw.githubusercontent.com/neufeldtech/funnyface/master/docs/img/postman.png" width="500px" />
- If everything is good, then you should get back something like this:
<img src="https://raw.githubusercontent.com/neufeldtech/funnyface/master/docs/img/barack-moustache.png" width="350px" />


### Fact
The main codebase for this was forked from https://github.com/sitepoint-editors/face-detection-nodejs
Thanks

### License
MIT
