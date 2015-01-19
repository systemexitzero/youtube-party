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
    if(query !== undefined) {
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if(pair[0] == variable) {
                return pair[1];
            }
        }
    }
    return(false);
};

var evalJSON = function (json) {
    return eval( "(" + json + ")" );
}
