


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

    stateImage(state);
    document.getElementById("cityState").innerHTML = 'Information about ' + city + ', ' + state;

    getCoordinates(city, state);
    getOri(city, state);
    //getNumberOfDisastersInState(state);

    document.getElementById("city").innerHTML = urlParams["citySearch"];
    document.getElementById("state").innerHTML = urlParams["stateSearch"];

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
                document.getElementById("aqi").innerHTML += aqi;
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
            "X-Api-Key": "Ctr6uwisQ6EUppc1JyoKg9iw2F7mDtgu"
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
                                   "X-Api-Key": "Ctr6uwisQ6EUppc1JyoKg9iw2F7mDtgu"
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
            "X-Api-Key": "Ctr6uwisQ6EUppc1JyoKg9iw2F7mDtgu"
        }
        })
        .then(result => result.json())
        .then(function(json) {
            elevation = (json.data.elevation * 3.28084).toFixed(1);
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
            "X-Api-Key": "Ctr6uwisQ6EUppc1JyoKg9iw2F7mDtgu"
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
        fallAvg = ((fallAvg * 1.8) + 32).toFixed(1);;
        winAvg = ((winAvg * 1.8) + 32).toFixed(1);;
        sumAvg = ((sumAvg * 1.8) + 32).toFixed(1);;
        sprAvg = ((sprAvg * 1.8) + 32).toFixed(1);;

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
        document.getElementById("fallAvg").innerHTML += fallAvg;

        document.getElementById("winAvgMin").innerHTML += winAvgMin;
        document.getElementById("sprAvgMin").innerHTML += sprAvgMin;
        document.getElementById("sumAvgMin").innerHTML += sumAvgMin;
        document.getElementById("fallAvgMin").innerHTML += fallAvgMin;

        document.getElementById("winAvgMax").innerHTML += winAvgMax;
        document.getElementById("sprAvgMax").innerHTML += sprAvgMax;
        document.getElementById("sumAvgMax").innerHTML += sumAvgMax;
        document.getElementById("fallAvgMax").innerHTML += fallAvgMax;

        document.getElementById("precipDays").innerHTML += prcpDays;
        document.getElementById("snowDays").innerHTML += snowDays;
        document.getElementById("snowYear").innerHTML += snowAmount;
        document.getElementById("precipYear").innerHTML += prcpAmount;

}


function stateImage(state){
    var states = [
        ['https://gisgeography.com/wp-content/uploads/2020/02/Arizona-Map-678x760.jpg', 'AZ'],
        ['https://gisgeography.com/wp-content/uploads/2013/01/Alabama-Map-1265x1878.jpg', 'AL'],
        ['https://gisgeography.com/wp-content/uploads/2013/02/Alaska-Map-1.jpg', 'AK'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Arkansas-Map-1265x1147.jpg', 'AR'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/California-Map-1265x1215.jpg', 'CA'],
        ['https://gisgeography.com/wp-content/uploads/2013/02/Colorado-Map.png', 'CO'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Connecticut-Map.jpg', 'CT'],
        ['https://gisgeography.com/wp-content/uploads/2013/02/Delaware-Map-0.jpg', 'DE'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Florida-Map.jpg', 'FL'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Georgia-Map.jpg', 'GA'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Hawaii-Map.png', 'HI'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Idaho-Map-678x917.jpg', 'ID'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Illinois-Map.jpg', 'IL'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Indiana-Map-1265x1733.jpg', 'IN'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Iowa-Map-1265x870.jpg', 'IA'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Kansas-Map.jpg', 'KS'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Kentucky-Map.jpg', 'KY'],
        ['https://gisgeography.com/wp-content/uploads/2013/02/Louisiana-Map.jpg', 'LA'],
        ['https://gisgeography.com/wp-content/uploads/2013/02/Maine-Map.jpg', 'ME'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Maryland-Map.jpg', 'MD'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Massachusetts-Map.jpg', 'MA'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Michigan-Map.jpg', 'MI'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Minnesota-Map.jpg', 'MN'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Mississippi-Map-662x1024.jpg', 'MS'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Missouri-Map.jpg', 'MO'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Montana-Map-1265x772.jpg', 'MT'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Nebraska-Map.jpg', 'NE'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Nevada-Map.jpg', 'NV'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/New-Hampshire-Map.jpg', 'NH'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/New-Jersey-Map.jpg', 'NJ'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/New-Mexico-Map.jpg', 'NM'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/New-York-Map.jpg', 'NY'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/North-Carolina-Map.jpg', 'NC'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/North-Dakota-Map-1265x806.jpg', 'ND'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Ohio-Map-1265x1312.jpg', 'OH'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Oklahoma-Map.jpg', 'OK'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Oregon-Map-1265x1009.jpg', 'OR'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Pennsylvania-Map.jpg', 'PA'],
        ['https://gisgeography.com/wp-content/uploads/2013/02/Rhode-Island-Map.jpg', 'RI'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/South-Carolina-Map.jpg', 'SC'],
        ['https://gisgeography.com/wp-content/uploads/2013/02/South-Dakota-Map.jpg', 'SD'],
        ['https://gisgeography.com/wp-content/uploads/2013/02/Tennessee-Map-1265x487.jpg', 'TN'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Texas-Map.jpg', 'TX'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Utah-Map.jpg', 'UT'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Vermont-Map.jpg', 'VT'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Virginia-Map.jpg', 'VA'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/Washington-Map.jpg', 'WA'],
        ['https://gisgeography.com/wp-content/uploads/2020/02/West-Virginia-Map.jpg', 'WV'],
        ['https://gisgeography.com/wp-content/uploads/2013/02/Wisconsin-Map.jpg', 'WI'],
        ['https://gisgeography.com/wp-content/uploads/2020/03/Wyoming-Map-1265x1039.jpg', 'WY'],
        ['https://gisgeography.com/wp-content/uploads/2020/06/Washington-DC-Road-Map.jpg', 'DC'],
    ];

    for(let i = 0; i < states.length; i++){
        if(states[i][1] == state){
            document.getElementById("stateImg").innerHTML = '<img class="stateMap"" src="' + states[i][0] + '" alt="' + state + ' Map">';
        }
    }
}


function getOri(city, state) {
    fetch('https://api.usa.gov/crime/fbi/sapi/api/agencies/list?API_KEY=7UqhaLCBzBdtdbC55K1C4WOfDLw95A4gCy9fa8RD')
        .then(res => res.json())
        .then(function(json){
            let x = processCrime(json, city, state);
            violentCrime(x);
            propertyCrime(x);
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


let totalCrime = 0;


function violentCrime(ori) {
    fetch ('https://api.usa.gov/crime/fbi/sapi/api/summarized/agencies/' + ori + '/violent-crime/2019/2019?API_KEY=7UqhaLCBzBdtdbC55K1C4WOfDLw95A4gCy9fa8RD')
        .then(res => res.json())
        .then(function(json){
            if (json.results.length > 0) {
                violentCrimeFormatted = numberWithCommas(json.results[0].actual);
                document.getElementById("crimeType").innerHTML += '<li>Violent Crime: ' +   violentCrimeFormatted + ' </li>';
                totalCrime += json.results[0].actual;
                totalCrimeFormatted = numberWithCommas(totalCrime);
                document.getElementById("totalCrime").innerHTML = 'Total Crime Incidents in 2019: ' + totalCrimeFormatted;
            } else {
                document.getElementById("totalCrime").innerHTML = 'No Data Found';
            }
    })
}

function propertyCrime(ori) {
    fetch ('https://api.usa.gov/crime/fbi/sapi/api/summarized/agencies/' + ori + '/property-crime/2019/2019?API_KEY=iiHnOKfno2Mgkt5AynpvPpUQTEyxE77jo1RU8PIv')
        .then(res => res.json())
        .then(function(json){
            if (json.results.length > 0) {
                propertyCrimeFormatted = numberWithCommas(json.results[0].actual);
                document.getElementById("crimeType").innerHTML += '<li>Property Crime: ' +   propertyCrimeFormatted + ' </li>';
                totalCrime += json.results[0].actual;
                totalCrimeFormatted = numberWithCommas(totalCrime);
                document.getElementById("totalCrime").innerHTML = 'Total Crime Incidents in 2019: ' + totalCrimeFormatted;
            } else {
                document.getElementById("totalCrime").innerHTML = 'No Data Found';
            }
        })
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function getNumberOfDisastersInState(state){
    fetch('FemaWebDisasterDeclarations.json')
        .then(res => res.json())
        .then(function(json){
            processDisasters(json.FemaWebDisasterDeclarations, state);
        })
        .catch(error => console.log('error', error));
}

function getNumberOfDisastersInState(state){
    fetch('FemaWebDisasterDeclarations.json')
        .then(res => res.json())
        .then(function(json){
            processDisasters(json.FemaWebDisasterDeclarations, state);
        })
        .catch(error => console.log('error', error));
}


function processDisasters(data, state){
    let numberOfDisasters = 0;
    let earliestDisaster = 2020;
    let disasterTypes = new Array(100);
    let disasterCount = new Array(100);
    let added = false;
    let j = 0;
    for (let i = 0; i < data.length; i++) {
        if (data[i].stateCode == state) {
            if (parseInt(data[i].declarationDate.substring(0,4)) < earliestDisaster) {
                earliestDisaster = data[i].declarationDate.substring(0,4);
            }
            numberOfDisasters++;
            while (disasterTypes[j] != undefined) {
                if (data[i].incidentType.valueOf() === disasterTypes[j].valueOf()){
                    disasterCount[j]++;
                    added = true;
                }
                j++;
            }
            if (!added) {
                disasterTypes[j] = data[i].incidentType;
                disasterCount[j] = 1;
            }
        }
        added = false;
        j = 0;
    }
    document.getElementById("disasters").innerHTML = 'Number of Natural Disasters Since ' + earliestDisaster + ' in ' + state + ': ' + numberOfDisasters;
    j = 0;
    let disasterDetails = "";
    while (disasterTypes[j] != undefined) {
        disasterDetails += '<li>' + disasterTypes[j] + ': ' + disasterCount[j] + '</li>';
        j++;
    }
    document.getElementById("disasterDetail").innerHTML = disasterDetails;
}

