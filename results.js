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

    city = urlParams["citySearch"];
    state = urlParams["stateSearch"];

    document.getElementById("city").innerHTML = city
    document.getElementById("state").innerHTML = state

    runCrimeAPI(city, state);
}

document.addEventListener("DOMContentLoaded", function() {
    getCityState();
})

function runCrimeAPI(city, state) {
    fetch(`https://api.usa.gov/crime/fbi/sapi/api/agencies/byStateAbbr/${state}?API_KEY=pc8WGc1rAHyDfUlRWhD4f3VVd1Ni2usOnBjteg4N`)
        .then(response => response.json())
        .then(data => obj = data)
        .then(() =>console.log(obj));


}

function findDepartment(department) {
    console.log(department)
    .then(departmentObj = obj.find(findDepartment))
    .then(console.log(departmentObj))
    .then(oriStr = departmentObj.ori)
    .then(fetch(`https://api.usa.gov/crime/fbi/sapi/api/summarized/agencies/${oriStr}/offenses/2019/2019?API_KEY=pc8WGc1rAHyDfUlRWhD4f3VVd1Ni2usOnBjteg4N`)
    .then(response => response.json())
    .then(data => crimeData = data)
    .then(console.log(crimeData)));;

    return department.name === (city + 'Police Department');
}