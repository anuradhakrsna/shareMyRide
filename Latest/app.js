var express = require("express");
var app = express();
var multer  = require('multer');
var upload = multer({ dest: '/public/userImages/' });
var fs = require('fs');
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
var uuid = require('node-uuid');
app.use(cookieParser());
app.use(bodyParser.json());

app.post("/signup/memberSignup",upload.single('displayImage'),function (req, res, next){
if(req.body.createorUpdateBack === 'Y')
{
    if(req.file){
        var tmp_path = req.file.path;
        var imageId = uuid.v4();
        var target_path = 'public/userImages/' + imageId;
        req.body.image = target_path;

        /** A better way to copy the uploaded file. **/
        var src = fs.createReadStream(tmp_path);
        var dest = fs.createWriteStream(target_path);
        src.pipe(dest);
        src.on('end', function() {console.log("File Uploaded Successfully"); });
        src.on('error', function(err) { res.json({error: true,message:err}); });
      }
      else
      {
          var target_path = 'public/userImages/default';
            req.body.image = target_path;
      }
}
else
{
    if(req.file){
        var tmp_path = req.file.path;
        var imageId = uuid.v4();
        var target_path = 'public/userImages/' + imageId;
        req.body.image = target_path;

        /** A better way to copy the uploaded file. **/
        var src = fs.createReadStream(tmp_path);
        var dest = fs.createWriteStream(target_path);
        src.pipe(dest);
        src.on('end', function() {console.log("File Uploaded Successfully"); });
        src.on('error', function(err) { res.json({error: true,message:err}); });
      }
}
    next();
});


var static = express.static(__dirname + '/public');

var configRoutes = require("./routes");

var exphbs = require('express-handlebars');

var Handlebars = require('handlebars');

var handlebarsInstance = exphbs.create({
    defaultLayout: 'main',
    // Specify helpers which are only registered on this instance.
    helpers: {
        asJSON: (obj, spacing) => {
            if (typeof spacing === "number")
                return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));
        
            return new Handlebars.SafeString(JSON.stringify(obj));
        }
    },
    partialsDir: [
        'views/partials/'
    ]
});

var rewriteUnsupportedBrowserMethods = (req, res, next) => {
    // If the user posts to the server with a property called _method, rewrite the request's method
    // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
    // rewritten in this middleware to a PUT route
    if (req.body && req.body._method) {
        req.method = req.body._method;
        delete req.body._method;
    }

    // let the next middleware run:
    next();
};

app.use("/public", static);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);
app.engine('handlebars', handlebarsInstance.engine);
app.set('view engine', 'handlebars');

configRoutes(app);

app.listen(3000, () => {
    console.log("We've now got a server for sharemyride project!");
    console.log("Your routes will be running on http://localhost:3000");
});