

let urlParams;
let oriValue;
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
    let city = urlParams["citySearch"];
    let state = urlParams["stateSearch"]
    document.getElementById("city").innerHTML += city;
    document.getElementById("state").innerHTML += state;
    getOri(city, state);
    getWeather(city, state);
}

document.addEventListener("DOMContentLoaded", function() {
    getCityState();
})

function getWeather(city, state) {
    jQuery.ajax({ 
        url: "https://www.ncdc.noaa.gov/cdo-web/api/v2/locations?locationcategoryid=CITY&sortfield=name&sortorder=desc", 
        data: {},
        headers: { token:"TUgKoQwISqgfzYZHwINEEwkiMKjTWjRG"} ,
        success: function(json) {
            console.log(json.results);
            
        }
    })


    }


function getOri(city, state) {
    fetch('https://api.usa.gov/crime/fbi/sapi/api/agencies/list?API_KEY=7UqhaLCBzBdtdbC55K1C4WOfDLw95A4gCy9fa8RD')
        .then(res => res.json())
        .then(function(json){
            let x = processCrime(json, city, state);
            document.getElementById("ori").innerHTML += x;
            violentCrime(x);
        })
}

function processCrime(data, city, state) {
    for (let i = 0; i < data.length; i++) {
        if (data[i].state_abbr == state) {
            if (data[i].agency_type_name == 'City') {
                if (data[i].agency_name.includes(city + ' Police')){
                    return data[i].ori;
                }
            }
        }
    }
}

function violentCrime(ori) {
    fetch ('https://api.usa.gov/crime/fbi/sapi/api/summarized/agencies/' + ori + '/violent-crime/2019/2019?API_KEY=7UqhaLCBzBdtdbC55K1C4WOfDLw95A4gCy9fa8RD')
        .then(res => res.json())
        .then(function(json){
            console.log(json.results);
            if (json.results.length < 1){
                document.getElementById("violent-crime").innerHTML += 'No Data Available';
            } else {
                document.getElementById("violent-crime").innerHTML += json.results[0].actual;
            }
    })
}
