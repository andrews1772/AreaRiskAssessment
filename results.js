

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
    fetch ("https://api.opencagedata.com/geocode/v1/json?q=" + city + ", " + state + ", " + "United States&key=847f8c6eb8a44b929583379a55f3ea99&countrycode=us")
    .then(result => result.json())
    .then(function(json) {
        console.log(json);
        length = json.results.length;
        var i;
        var maxConfidence = 0;
        for(i = 0; i <length; i++) {
            if (json.results[i].confidence > 0) {
                if (json.results[i].confidence >= maxConfidence) {
                    maxConfidence = json.results[i].confidence;
                    lat = json.results[i].geometry.lat;
                    long = json.results[i].geometry.lng;
                    county = json.results[i].components.county
                }
            }
        }
        if (maxConfidence == 0) {
        //no good match found    
        } else {
            getAirQuality(city, state, lat, long, county);
        }
    })
    .catch(error => console.log('error', error));



    getOri(city, state);
}

document.addEventListener("DOMContentLoaded", function() {
    getCityState();
})


function getAirQuality(city, state, lat, long, county) {
    stateName = abbrState(state, 'name');

    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };
      fetch("http://api.airvisual.com/v2/nearest_city?lat=" + lat + "&lon=" + long + "&key=2b705434-b20d-4352-b97d-e7aacd89cfde", requestOptions)
        .then(result => result.json())
        .then(function(json) {
            console.log(json);
            if (json.data.message == 'city_not_found') {
                //thats not good
            } else {
                getWeather(city, state, lat, long), county;
            }
        })
        .catch(error => console.log('error', error));

function getWeather(city, state, lat, long, county) {

 console.log(lat);
 console.log(long);
    fetch(`https://api.meteostat.net/v2/stations/nearby?lat=${lat}&lon=${long}`, {
  headers: {
    "X-Api-Key": "jLCFxU01dr5LpQEqYoYLPP0DTbjnFA3e"
  }
})
.then(result => result.json())
.then(function(json) {
    console.log(json);
    if (json.data == null) {
        //not good
    } else {
        length = json.data.length;
        var i;
        var minDistance = 100;
        var stationID = null;
        for(i = 0; i <length; i++) {
            if (json.data[i].confidence > 0) {
                if (json.data[i].confidence <= minDistance) {
                    minDistance = json.data[i].distance;
                    stationID = json.data[i].id;
                }
            }
        }
        getStationClimate(stationID);
    }
})
.catch(error => console.log('error', error));

}
}
function getStationClimate(stationID) {
    fetch("https://api.meteostat.net/v2/stations/climate?station=" + stationID, {
         headers: {
            "X-Api-Key": "jLCFxU01dr5LpQEqYoYLPP0DTbjnFA3e"
        }
        })
    .then(result => result.json())
        .then(function(json) {
            console.log(json);
 
})
.catch(error => console.log('error', error));
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
function abbrState(input, to){
    
    var states = [
        ['Arizona', 'AZ'],
        ['Alabama', 'AL'],
        ['Alaska', 'AK'],
        ['Arkansas', 'AR'],
        ['California', 'CA'],
        ['Colorado', 'CO'],
        ['Connecticut', 'CT'],
        ['Delaware', 'DE'],
        ['Florida', 'FL'],
        ['Georgia', 'GA'],
        ['Hawaii', 'HI'],
        ['Idaho', 'ID'],
        ['Illinois', 'IL'],
        ['Indiana', 'IN'],
        ['Iowa', 'IA'],
        ['Kansas', 'KS'],
        ['Kentucky', 'KY'],
        ['Louisiana', 'LA'],
        ['Maine', 'ME'],
        ['Maryland', 'MD'],
        ['Massachusetts', 'MA'],
        ['Michigan', 'MI'],
        ['Minnesota', 'MN'],
        ['Mississippi', 'MS'],
        ['Missouri', 'MO'],
        ['Montana', 'MT'],
        ['Nebraska', 'NE'],
        ['Nevada', 'NV'],
        ['New Hampshire', 'NH'],
        ['New Jersey', 'NJ'],
        ['New Mexico', 'NM'],
        ['New York', 'NY'],
        ['North Carolina', 'NC'],
        ['North Dakota', 'ND'],
        ['Ohio', 'OH'],
        ['Oklahoma', 'OK'],
        ['Oregon', 'OR'],
        ['Pennsylvania', 'PA'],
        ['Rhode Island', 'RI'],
        ['South Carolina', 'SC'],
        ['South Dakota', 'SD'],
        ['Tennessee', 'TN'],
        ['Texas', 'TX'],
        ['Utah', 'UT'],
        ['Vermont', 'VT'],
        ['Virginia', 'VA'],
        ['Washington', 'WA'],
        ['West Virginia', 'WV'],
        ['Wisconsin', 'WI'],
        ['Wyoming', 'WY'],
    ];

    if (to == 'abbr'){
        input = input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        for(i = 0; i < states.length; i++){
            if(states[i][0] == input){
                return(states[i][1]);
            }
        }    
    } else if (to == 'name'){
        input = input.toUpperCase();
        for(i = 0; i < states.length; i++){
            if(states[i][1] == input){
                return(states[i][0]);
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
