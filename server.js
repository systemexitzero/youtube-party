
var express 	= require('express');
var app 		= express();
var hbs 		= require('hbs');

var port = process.env.PORT || 12221;

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/public/views');

app.engine('hbs', require('hbs').__express);

hbs.registerPartials('./public/views/partials/');

require('./app/routes')(app);

app.listen(port);
console.log("app listening on port " + port);
exports = module.exports = app;