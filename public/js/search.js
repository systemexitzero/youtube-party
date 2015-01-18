var submitSearch = function () {
    var json = {};
    var searchBox = document.getElementById("searchBox");
    var passin = getQueryVariable(searchBox.value);
    if(passin === false) {
        json.value = searchBox.value;
    }
    else {
        json.value = passin;
    }

    searchBox.value = "";

    console.log(json);
    var jsonstr = JSON.stringify(json);
    var xhr = makeHttpRequest("POST", "/search");
    xhr.setRequestHeader("Content-type","application/json");
    xhr.setRequestHeader("Content-length",jsonstr.length);
    xhr.setRequestHeader("Connection", "close");
    xhr.send(jsonstr);
    return false;
}
