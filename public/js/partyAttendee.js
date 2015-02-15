var PartyAttendee = function () {
    var that = {};

    var name = "Anon";

    var player = {};
    var lastState = {};
    var synced = false;
    var evtSource;
    var clientList = {};

    var changeName = function () {
        var nameElem = document.getElementById('changeName');
        nameElem.innerHTML = "";
        // set to change mode
        var text = document.createElement("INPUT");
        text.type = "text";
        text.id = "nameText";
        text.cols = 45;
        text.rows = 1;
        text.maxlength = 45;
        text.name = "tBox";
        var sbmt = document.createElement("INPUT");
        sbmt.type = "submit";
        sbmt.value = "Submit";
        sbmt.onclick = confirmName;
        nameElem.appendChild(text);
        nameElem.appendChild(sbmt);
    }

    var confirmName = function () {
        var newNameElem = document.getElementById("nameText");
        var nameElem = document.getElementById('changeName');
        // set page to regular name view
        nameElem.innerHTML = "<span id='userName'>" + newNameElem.value + "</span>";
        userElem.onclick = PartyAttendee.changeName;
        // send new name back to the server
    }

    //listen for server events
    var setupEvents = function () {
        var eventListenerId = 0;
        clientList = document.getElementById('clientList');
        evtSource = new EventSource("/events");
        evtSource.addEventListener("sync", function (e) {
            console.log(e.data);
            if(player === undefined) { return; }
            eventListenerId = parseInt(e.id);
            var json = evalJSON(e.data);
            if(json.videoId !== lastState.videoId) {
                synced = false;
                player.cueVideoById(json.videoId, json.time);
                lastState.videoId = json.videoId;
            }
            if(json.pState !== lastState.pState) {
                synced = false;
                if(json.pState === 1) {
                    player.playVideo();
                    lastState.pState = json.pState;
                }
                else if (json.pState === 2) {
                    player.pauseVideo();
                    lastState.pState = json.pState;
                }
            }
            // time handled in state change
            lastState.time = json.time;

            var cList = "";
            json.clients.forEach(function (client) {
                cList += "<li> " + client + "</li>";
            });
            clientList.innerHTML = cList;

        });
    };

    var onPlayerReady = function (event) {
        player.mute();

        //console.log(lastState.pState);
        if(lastState.pState === YT.PlayerState.PLAYING) {
            player.seekTo(lastState.time, true);
            synced = true;
        }
        else if (lastState.pState === -1 ||
            lastState.pState === YT.PlayerState.CUED ||
            lastState.pState === YT.PlayerState.ENDED) {
                synced = true;
        }
        setupEvents();
    };

    var onPlayerStateChange = function(event) {
        if((event.data === YT.PlayerState.PLAYING ||
            event.data === YT.PlayerState.PAUSED))
        {
            if(synced === true) {
                // synced clients can send status changes
                var diffs = {};
                diffs.videoId = getVideoId();
                diffs.pState = event.data;
                diffs.time = player.getCurrentTime();

                // save created state
                lastState = diffs;

                // sync new state
                var req = makeHttpRequest("POST", "/state");
                var diffstr = JSON.stringify(diffs);
                req.setRequestHeader("Content-type", "application/json");
                req.setRequestHeader("Content-length", diffstr.length);
                req.setRequestHeader("Connection", "close");
                req.send(diffstr);
            }
            else if(event.data === YT.PlayerState.PLAYING &&
                Math.abs(player.getCurrentTime() - lastState.time) > 0.3) {
                    player.seekTo(lastState.time, true);
                    synced = true;
            }
        }
    };

    var getVideoId = function () {
        return getQueryVariable("v", player.getVideoUrl());
    };

    that.getName = function () { return name; }
    that.changeName = changeName;
    that.confirmName = confirmName;
    that.onPlayerReady = onPlayerReady;
    that.onPlayerStateChange = onPlayerStateChange;
    //TODO(james): figure out what is going on with object references here
        // why does it require the function setters?
    that.player = player;
    that.setPlayer = function (p) { player = p; };
    that.lastState = lastState;
    that.setLastState = function(ls) { lastState = ls; };

    return that;
}();
