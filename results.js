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
    getOri(city, state);
    getNumberOfDisastersInState(state);
}

document.addEventListener("DOMContentLoaded", function() {
    getCityState();
})

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
let totalCrime = 0;
function violentCrime(ori) {
    fetch ('https://api.usa.gov/crime/fbi/sapi/api/summarized/agencies/' + ori + '/violent-crime/2019/2019?API_KEY=7UqhaLCBzBdtdbC55K1C4WOfDLw95A4gCy9fa8RD')
        .then(res => res.json())
        .then(function(json){
            if (json.results.length > 0) {
                document.getElementById("crimeType").innerHTML += '<li>Violent Crime: ' + json.results[0].actual + ' </li>';
                totalCrime += json.results[0].actual;
                document.getElementById("totalCrime").innerHTML = 'Total Crime Incidents in 2019: ' + totalCrime;
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
                document.getElementById("crimeType").innerHTML += '<li>Property Crime: ' + json.results[0].actual + ' </li>';
                totalCrime += json.results[0].actual;
                document.getElementById("totalCrime").innerHTML = 'Total Crime Incidents in 2019: ' + totalCrime;
            } else {
                document.getElementById("totalCrime").innerHTML = 'No Data Found';
            }
        })
}

function getNumberOfDisastersInState(state){
    fetch('FemaWebDisasterDeclarations.json')
        .then(res => res.json())
        .then(function(json){
            processDisasters(json.FemaWebDisasterDeclarations, state);
        })
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
