// 2. load the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var lastState = {};
var synced = false;

var evtSource;

//listen for server events
var setupEvents = function () {
    var eventListenerId = 0;

    evtSource = new EventSource("/events");
    evtSource.addEventListener("sync", function (e) {
        //console.log(e.data);
        if(player === undefined) { return; }
        eventListenerId = parseInt(e.id);
        var json = evalJSON(e.data);
        if(json.videoId !== lastState.videoId) {
            synced = false;
            player.cueVideoFromId(json.videoId);
            lastState.videoId = json.videoId;
        }
        if(json.pState !== lastState.pState) {
            if(json.pState === 1) {
                synced = false;
                player.playVideo();
                lastState.pState = json.pState;
            }
            else if (json.pState === 2) {
                synced = false;
                player.pauseVideo();
                lastState.pState = json.pState;
            }   
        }
        // time handled in state change
        lastState.time = json.time;

    });
}();





var getVideoId = function () {
    return getQueryVariable("v", player.getVideoUrl());
}

var onYouTubeIframeAPIReady = function () {
    // get current server state
    var req = makeHttpRequest("GET", "/state");
    
    req.onload = function () {
        if(req.readyState === 4 && req.status === 200) {
            //console.log("data received: " + req.responseText);
            var json = evalJSON(req.responseText);

            // do things with the returned state
            lastState = json;
            player = new YT.Player('player', {
                height: '390',
                width: '640',
                videoId: lastState.videoId,
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        }
        else {
            player = document.getElementById('player');
            player.innerHTML = "party server error";
        }
    }
    req.send();
}

var onPlayerReady = function (event) {
    player.mute();

    //console.log(lastState.pState);
    if(lastState.pState === 1) {
        player.seekTo(lastState.time, true);
        synced = true;
    }
    else if (lastState.pState === -1 || lastState.pState === 5) {
        synced = true;
    }
}

var onPlayerStateChange = function(event) {
    // find differences


    if((event.data === 1 || event.data === 2))
    {
        //console.log("state: " + event.data +" synced: " + synced + " time: " + player.getCurrentTime());
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
        else if(event.data === 1 && 
            Math.abs(player.getCurrentTime() - lastState.time) > 1.0) {
            //console.log("seek to server state");
            player.seekTo(lastState.time, true);
            synced = true;
        }
        else {
            synced = true;
        }
    }   
}


var makeHttpRequest = function (method, url) {
    var xhr = new XMLHttpRequest();
    if("withCredentials" in xhr) {
        xhr.open(method, url, true);
    }
    else if (typeof XDomainRequest !== "undefined") {
        xhr = new XDomainRequest();
        xhr.open(method, url);
    }
    else {
        xhr = null;
    }

    if(xhr === null) {
        throw new Error("could not create XD request");
    }
    return xhr;
};

var getQueryVariable = function (variable, url)
{
    var query = url.split("?")[1];
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable) {
            return pair[1];
        }
    }
    return(false);
};

var evalJSON = function (json) {
    return eval( "(" + json + ")" );
}