var submitSearch = function () {
    var json = {};
    json.value = "";
    var searchBox = document.getElementById("searchBox");
    //if url
    // @stephenhay valid url regex from https://mathiasbynens.be/demo/url-regex
    if(/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(searchBox.value)) {
        var vId = getQueryVariable("v", searchBox.value);
        if(!vId){
            //short url
            vId = searchBox.value.split("http://youtu.be/")[1];
        }
        json.value = vId;
    }
    else {
        // just the id
        if(/\s+|\//.test(searchBox.value) === false) {
            json.value = searchBox.value;
        }
    }
    console.log(json.value);
    searchBox.value = "";

    var jsonstr = JSON.stringify(json);
    var xhr = makeHttpRequest("POST", "/search");
    xhr.setRequestHeader("Content-type","application/json");
    xhr.setRequestHeader("Content-length",jsonstr.length);
    xhr.setRequestHeader("Connection", "close");
    xhr.send(jsonstr);
    return false;
}
