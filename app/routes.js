var _		= require('underscore');

var serverState = {
	"videoId": 'yhNZDl4-nck',
	"pState": -1,
	"time": 0 //seconds
};

// utils ==========
var constructSSE = function (res, id, data) {
	// write to the "stream"
	res.write("event: sync\n");
	res.write("id: " + id + "\n");
	res.write("data:" + data + "\n\n");
};

var getServerState = function () { return serverState; }

module.exports = function (app) {
	

	// routes =======
	app.post("/state", function (req, res) {
		// set server state as indicated by client
		var resState = req.body;
		console.log(" vId: " + resState.videoId);
		serverState.videoId = resState.videoId;

		console.log(" pState: " + resState.pState);
		serverState.pState = resState.pState;
		
		console.log(" time: " + resState.time);
		serverState.time = resState.time;

		res.set({
  			'Content-Type': 'text/plain',
  			'Content-Length': "OK".length
  		});
		res.status(200).send("OK");
	});

	app.get("/state", function (req, res) {
		// route to ask for server state
		console.log("serve state info");
		res.status(200).json(serverState);

	});

	app.get("/events", function (req, res) {
		res.status(200);
		res.set({
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive'
		});

		var id = (new Date()).toLocaleTimeString();

		// Sends a SSE every 5 seconds on a single connection.
		setInterval(function() {
			constructSSE(res, id, JSON.stringify(getServerState()));
		}, 1000);

		constructSSE(res, id, JSON.stringify(getServerState()));
	});

	app.get("/*", function (req, res) {
		var data = {};
		res.render("index.hbs", data);
	});
}
