//create an app server
var express = require("express");
var app = express();

//set path to the views (template) directory
app.set('views', __dirname + '/app');

//set path to static files
app.use(express.static(__dirname + '/app'));

//handle GET requests on /
app.get('/', function(req, res){res.render('index.html', {});});

//listen on localhost:3000
app.listen(3501);
console.log('localhost:3501');