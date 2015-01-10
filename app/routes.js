var _		= require('underscore');

module.exports = function (app) {
	app.get("/*", function (req, res) {
		var data = {};
		res.render("index.hbs", data);
	});
}
