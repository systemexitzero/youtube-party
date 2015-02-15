
// load the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var onYouTubeIframeAPIReady = function () {
    // get current server state
    var req = makeHttpRequest("GET", "/state");

    req.onload = function () {
        if(req.readyState === 4 && req.status === 200) {
            //console.log("data received: " + req.responseText);
            var json = evalJSON(req.responseText);

            // do things with the returned state
            PartyAttendee.setLastState(json);
            PartyAttendee.setPlayer(new YT.Player('player', {
                height: '390',
                width: '640',
                videoId: json.videoId,
                events: {
                    'onReady': PartyAttendee.onPlayerReady,
                    'onStateChange': PartyAttendee.onPlayerStateChange
                }
            }));
        }
        else {
            player = document.getElementById('player');
            player.innerHTML = "party server error";
        }
    }
    req.send();
};

// TODO(james): don't leave this here
var userElem = document.getElementById('userName');
userElem.innerHTML = PartyAttendee.getName();
userElem.onclick = PartyAttendee.changeName;
