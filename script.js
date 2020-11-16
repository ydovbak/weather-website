"use strict";
const ApiKey = 'f4a88f380ea81884743aec0bbf45f133';

const $ = (selector) => document.querySelector(selector);

window.onload = () => {

    const tabs = document.querySelectorAll(".nav-link");
    for (let tab of tabs) {
        tab.addEventListener('click', (event) => {
            console.log('called', event);
            $('#day-of-week').innerText = 'Date';
        });
    }

    //const lat = 53.43333;
    //const lon = -7.95;

    navigator.geolocation.getCurrentPosition((pos) => {
        console.log(pos.coords);
        getForecast5days(pos.coords.latitude, pos.coords.longitude, 'metric', handleForecastResponseCallback);
        getOneApiCall(pos.coords.latitude, pos.coords.longitude, 'metric', handleOneCallForecast);
    }, err => {
        alert('could not determine geo location, please enter your city');
        console.error(err);
    });

};



const handleOneCallForecast = (err, response) => {
    if (err) {
        console.log("Something happened");
    } else {
        console.log("Success");
        console.log(response);

        //Filling in current weather into Main Weather Panel
        $('#temperature').innerHTML = parseInt(response.current.temp) + " &#8451;";
        $('#feels-like').innerHTML += " " + parseInt(response.current.feels_like) + '&#8451';
        $('#humidity').innerText += " " + response.current.humidity + " %";
        $('#wind-speed').innerText += " " + response.current.wind_speed + " m/s";
        $('#wind-dir').innerText += " " + getCardinalDirection(response.current.wind_deg);
        $('#uv-index').innerText += " " + response.current.uvi;
        $('#clouds').innerText += response.current.clouds + " %";
        $('#pressure').innerText += " " + (response.current.pressure / 100) + " mb"; //Converting pressure from hpa to mb
        $('#visibility').innerText += " " + parseInt(response.current.visibility / 1000) + " km"; //Visibility is given in meters in API, converting to km
        $('#weather-icon').src = `https://openweathermap.org/img/wn/${response.current.weather[0].icon}@4x.png`;

    }
};

const handleForecastResponseCallback = (err, response) => {
    if (err) {
        alert('Something happened');
    } else {
        const city = response.city;
        $('#city-name').innerText = city.name;
        console.log(response);
    }
};

const getOneApiCall = (lat, lon, units, callback) => {
    const parts = 'minutely,hourly,alerts';
    const URL = `https://api.openweathermap.org/data/2.5/onecall?units=${units}&lat=${lat}&lon=${lon}&exclude=${parts}&appid=${ApiKey}`;
    ajaxGetRequest(URL, callback);
};

const getForecast5days = (lat, lon, units, callback) => {
    const URL = `https://api.openweathermap.org/data/2.5/forecast?&units=${units}&lat=${lat}&lon=${lon}&appid=${ApiKey}`;
    ajaxGetRequest(URL, callback);
}

const ajaxGetRequest = (url, callback) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = "json";

    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4) {
            // all good
            if (xhr.status >= 200 && xhr.status < 400) {
                callback(null, xhr.response);
            } else {
                callback(xhr, null);
            }
        }
    };
    xhr.onerror = e => console.log(e.message);

    xhr.open("GET", url);
    xhr.send();
}


//
//Utility Methods
//
function getCardinalDirection(angle) {
    const directions = ['↑ N', '↗ NE', '→ E', '↘ SE', '↓ S', '↙ SW', '← W', '↖ NW'];
    return directions[Math.round(angle / 45) % 8];
}