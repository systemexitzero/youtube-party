var _		= require('underscore');
var events  = require('events');
var url 	= require('url');

var serverState = {
	"videoId": 'yhNZDl4-nck',
	"pState": -1,
	"time": 0 //seconds
};

// utils ==========
var eventEmitter = new events.EventEmitter();
var eventClients = {};

var isWin = process.platform === 'win32';

var constructSSE = function (res, id, data) {
	res.write("event: sync\n");
	res.write("id: " + id + "\n");
	res.write("data:" + data + "\n\n");
};

var clone = function (obj) {
	//TODO(james): expand this to do a full deep copy?
	var c = {};
	for(var k in obj) {
		c[k] = obj[k];
	}
	return c;
};

var getServerState = function () {
	var out = clone(serverState);
	out.clients = [];
	for(var k in eventClients) {
		out.clients.push(eventClients[k]);
	}
	return out;
}

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

		eventEmitter.emit('notifyClients');

		res.set({
  			'Content-Type': 'text/plain',
  			'Content-Length': "OK".length
  		});
		res.status(200).send("OK");
	});

	app.get("/state", function (req, res) {
		// route to ask for server state
		res.status(200).json(serverState);

	});

	app.get("/events", function (req, res) {
		var id = '';
		if(isWin) {
			id = 1;
			while(id in eventClients) {
				id = Math.floor(Math.random() * 1000);
			}
		}
		else {
			id = req.socket._handle.fd;
		}
		console.log("new EventClient: " + id);
		eventClients[id] = "req";

		urlParts = url.parse(req.url, true);
		var query = urlParts.query;
		if(query.hasOwnProperty("name")) {
			eventClients[id] = query.name;
		}

		res.status(200);
		res.set({
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive'
		});

		var notify = function () {
			console.log("notify sync event: " + id);
			constructSSE(res, id, JSON.stringify(getServerState()));
		}

		eventEmitter.on('notifyClients', notify);
		constructSSE(res, id, JSON.stringify(getServerState()));

		req.on('close', function () {
			delete eventClients[id];
			console.log("remove client: " + id);
			eventEmitter.removeListener('notifyClients', notify);
		});

		//notify clients of new connection
		eventEmitter.emit('notifyClients');
	});

	app.post("/search", function (req, res) {
		var query = req.body;
		serverState.videoId = query.value;
		serverState.pState = 2;
		serverState.time = 0;
		eventEmitter.emit('notifyClients');
		res.status(200).send(query.value);
	});

	app.get("/*", function (req, res) {
		var state = getServerState();
		var data = {
			clients : state.clients
		};
		res.render("index.hbs", data);
	});
}
