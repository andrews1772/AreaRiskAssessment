

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

    getCoordinates(city, state);
    getOri(city, state);
}

document.addEventListener("DOMContentLoaded", function() {
    getCityState();
})

//grabs lat and long from city and state searc
function getCoordinates(city, state) {
    var url = "https://api.opencagedata.com/geocode/v1/json?q=" + city + ", " + state + ", " + "United States&key=847f8c6eb8a44b929583379a55f3ea99&countrycode=us"
    var uriEncoded = encodeURI(url);
    fetch (uriEncoded)
    .then(result => result.json())
    .then(function(json) {
        length = json.results.length;
        var i;
        var maxConfidence = 0;
        var iMax = 0;
        for(i = 0; i <length; i++) {
            if (json.results[i].confidence > 0) {
                if (json.results[i].confidence >= maxConfidence) {
                    maxConfidence = json.results[i].confidence;
                    iMax = i;
                    lat = json.results[i].geometry.lat;
                    long = json.results[i].geometry.lng;
                    county = json.results[i].components.county
                }
            }
        }
        if (maxConfidence == 0) {
        //no good match found    
        } else {

            //use this for website
            document.getElementById("county").innerHTML += county;
            document.getElementById("lat").innerHTML += lat;
            document.getElementById("long").innerHTML += long;

            getAirQuality(city, state, lat, long, county);
        }
    })
    .catch(error => console.log('error', error));
}

//grabs air quality from coordinates
function getAirQuality(city, state, lat, long, county) {
    stateName = abbrState(state, 'name');

    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };

      fetch("http://api.airvisual.com/v2/nearest_city?lat=" + lat + "&lon=" + long + "&key=2b705434-b20d-4352-b97d-e7aacd89cfde", requestOptions)
        .then(result => result.json())
        .then(function(json) {
            if (json.data.message == 'city_not_found') {
                //thats not good
            } else {
                var aqi = json.data.current.pollution.aqius;
                document.getElementById("aqi").innerHTML += lat;
                getWeather(city, state, lat, long), county;
            }
        })
        .catch(error => console.log('error', error));
    }

    var foundValidStation = false;
    //grabs weather station closest to coordinates with valid weather data
function getWeather(city, state, lat, long, county) {


    fetch(`https://api.meteostat.net/v2/stations/nearby?lat=${lat}&lon=${long}`, {
    headers: {
            "X-Api-Key": "jLCFxU01dr5LpQEqYoYLPP0DTbjnFA3e"
    }
    })
    .then(result => result.json())
    .then(function(json) {
        if (json.data == null) {
          //not good
        } else {
            length = json.data.length;
            var i;
            var minDistance = 100;
            var stationID = null;
            var maxDailyData = 0;
            var dailyData = null;
            for(i = 0; i <length; i++) { 
                if (!foundValidStation) {
                    if (json.data[i].distance <= minDistance) {
                        if (json.data[i].active == true) {
                            fetch("https://api.meteostat.net/v2/stations/meta?id=" + json.data[i].id, {
                                headers: {
                                   "X-Api-Key": "jLCFxU01dr5LpQEqYoYLPP0DTbjnFA3e"
                               }
                               })
                               .then(result => result.json())
                               .then(function(json) {
                                   
                                   start = json.data.inventory.daily.start;
                                   end = json.data.inventory.daily.end;
                                   if (start != null && end != null) {
                                    var startInt = parseInt(start.substring(0,4));
                                    var endInt = parseInt(end.substring(0,4));
                                    dailyData = (endInt - startInt);
                                    stationID = json.data.id;
                                    getStationClimate(stationID, dailyData);
                                    i = length++;
                                   } else {
                                        dailyData = null;
                                   }
                           })
                           .catch(error => console.log('error', error));
                        }

                    } 
                }

                }
        }
    })
    .catch(error => console.log('error', error));
        //didnt find one with daily data
}

//grab start and end dates to calculate climate
function getStationClimate(stationID, dailyData) {

    if (!foundValidStation) {
    fetch("https://api.meteostat.net/v2/stations/meta?id=" + stationID, {
         headers: {
            "X-Api-Key": "jLCFxU01dr5LpQEqYoYLPP0DTbjnFA3e"
        }
        })
        .then(result => result.json())
        .then(function(json) {
            document.getElementById("elevation").innerHTML += elevation;
            start = json.data.inventory.daily.start;
            end = json.data.inventory.daily.end;
            var startInt = parseInt(start.substring(0,4));
            var endInt = parseInt(end.substring(0,4));
            if (dailyData > 30) {
                startInt = endInt - 1;
            }
            getAverageClimate(json, stationID, startInt, endInt)
 
    })
    .catch(error => console.log('error', error));
    foundValidStation = true;
} else {

}
}

//calculate climate values
function getAverageClimate(json, stationID, startInt, endInt) {
    var url = ("https://api.meteostat.net/v2/stations/daily?station=68816&start=" + startInt + "-01-01&end=" + endInt + "-01-01");
    var encoded = encodeURI(url);
    fetch(encoded, {
        headers: {
            "X-Api-Key": "jLCFxU01dr5LpQEqYoYLPP0DTbjnFA3e"
        }
        })
        .then(result => result.json())
        .then(function(json) {
            sumAverages(json.data);
    })
    .catch(error => console.log('error', error));

}
function sumAverages(data) {
    var i;
    var winterSum = 0;
    var winterSumMax = 0;
    var winterSumMin = 0;
    var summerSum = 0;
    var summerSumMax = 0;
    var summerSumMin = 0;
    var springSum = 0;
    var springSumMax = 0;
    var springSumMin = 0;
    var fallSum = 0;
    var fallSumMax = 0;
    var fallSumMin = 0;
    var prcpDays = 0;
    var snowDays = 0;
    var prcpAmount = 0;
    var snowAmount = 0;
    for(i = 0; i < 60; i ++) {
        if (data[i].prcp != null) {
            prcpDays++;
            prcpAmount+=data[i].prcp;
        }
        if (data[i].snow != null) {
            snowDays++;
            snowAmount+=data[i].prcp;
        }
        if (data[i].tavg != null) {
            winterSum+= data[i].tavg;
        }
        if (data[i].tmax != null) {
            winterSumMax+= data[i].tmax;
        }
        if (data[i].tmin != null) {
            winterSumMin+= data[i].tmin;
        }


    }
    for(i = 61; i < 151; i ++) {
        if (data[i].prcp != null) {
            prcpDays++;
            prcpAmount+=data[i].prcp;
        }
        if (data[i].snow != null) {
            snowDays++;
            snowAmount+=data[i].prcp;
        }
        if (data[i].tavg != null) {
            springSum+= data[i].tavg;
        }
        if (data[i].tmax != null) {
            springSumMax+= data[i].tmax;
        }
        if (data[i].tmin != null) {
            springSumMin+= data[i].tmin;
        }
    }
    for(i = 152; i < 242; i ++) {
        if (data[i].prcp != null) {
            prcpDays++;
            prcpAmount+=data[i].prcp;
        }
        if (data[i].snow != null) {
            snowDays++;
            snowAmount+=data[i].prcp;
        }
        if (data[i].tavg != null) {
            summerSum+= data[i].tavg;
        }
        if (data[i].tmax != null) {
            summerSumMax+= data[i].tmax;
        }
        if (data[i].tmin != null) {
            summerSumMin+= data[i].tmin;
        }
    }
    for(i = 243; i < 333; i ++) {
        if (data[i].prcp != null) {
            prcpDays++;
            prcpAmount+=data[i].prcp;
        }
        if (data[i].snow != null) {
            snowDays++;
            snowAmount+=data[i].prcp;
        }
        if (data[i].tavg != null) {
            fallSum+= data[i].tavg;
        }
        if (data[i].tmax != null) {
            fallSumMax+= data[i].tmax;
        }
        if (data[i].tmin != null) {
            fallSumMin+= data[i].tmin;
        }
    }
    for(i = 334; i < 366; i ++) {
        if (data[i].prcp != null) {
            prcpDays++;
            prcpAmount+=data[i].prcp;
        }
        if (data[i].snow != null) {
            snowDays++;
            snowAmount+=data[i].prcp;
        }
        if (data[i].tavg != null) {
            winterSum+= data[i].tavg;
        }
        if (data[i].tmax != null) {
            winterSumMax+= data[i].tmax;
        }
        if (data[i].tmin != null) {
            winterSumMin+= data[i].tmin;
        }
    }


        winAvg = winterSum / 90;
        winAvgMax = winterSumMax / 90;
        winAvgMin = winterSumMin / 90;

        sumAvg = summerSum / 90;
        sumAvgMax = summerSumMax / 90;
        sumAvgMin = summerSumMin / 90;

        sprAvg = springSum / 90;
        sprAvgMax = springSumMax / 90;
        sprAvgMin = springSumMin / 90;

        fallAvg = fallSum / 90;
        fallAvgMax = fallSumMax / 90;
        fallAvgMin = fallSumMin / 90;

        var conversion = 1.8;
        fallAvg = ((fallAvg * 1.8) + 32);
        winAvg = ((winAvg * 1.8) + 32);
        sumAvg = ((sumAvg * 1.8) + 32);
        sprAvg = ((sprAvg * 1.8) + 32);

        fallAvgMin = ((fallAvgMin * 1.8) + 32).toFixed(1);
        winAvgMin = ((winAvgMin * 1.8) + 32).toFixed(1);
        sumAvgMin = ((sumAvgMin * 1.8) + 32).toFixed(1);
        sprAvgMin = ((sprAvgMin * 1.8) + 32).toFixed(1);
        
        fallAvgMax = ((fallAvgMax * 1.8) + 32).toFixed(1);
        winAvgMax = ((winAvgMax * 1.8) + 32).toFixed(1);
        sumAvgMax = ((sumAvgMax * 1.8) + 32).toFixed(1);
        sprAvgMax = ((sprAvgMax * 1.8) + 32).toFixed(1);

        prcpAmount = (prcpAmount / 25.4).toFixed(1);

        snowAmount = (snowAmount / 25.4).toFixed(1);


        document.getElementById("winAvg").innerHTML += winAvg;
        document.getElementById("sprAvg").innerHTML += sprAvg;
        document.getElementById("sumAvg").innerHTML += sumAvg;
        document.getElementById("fallAvg").innerHTML += fallAVg;

        document.getElementById("winAvgMin").innerHTML += winAvgMin;
        document.getElementById("sprAvgMin").innerHTML += sprAvgMin;
        document.getElementById("sumAvgMin").innerHTML += sumAvgMin;
        document.getElementById("fallAvgMin").innerHTML += fallAVgMin;

        document.getElementById("winAvgMax").innerHTML += winAvgMax;
        document.getElementById("sprAvgMax").innerHTML += sprAvgMax;
        document.getElementById("sumAvgMax").innerHTML += sumAvgMax;
        document.getElementById("fallAvgMax").innerHTML += fallAvgMax;

        document.getElementById("precipDays").innerHTML += prcpDays;
        document.getElementById("snowDays").innerHTML += snowDays;
        document.getElementById("snowYear").innerHTML += snowAmount;
        document.getElementById("precipYear").innerHTML += prcpAmount;

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
