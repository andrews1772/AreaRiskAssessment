let urlParams;
(window.onpopstate = function () {
    let match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
        urlParams[decode(match[1])] = decode(match[2]);
})();

function getCityState() {
    document.getElementById("city").innerHTML = urlParams["citySearch"];
    document.getElementById("state").innerHTML = urlParams["stateSearch"];
}

document.addEventListener("DOMContentLoaded", function() {
    getCityState();
})