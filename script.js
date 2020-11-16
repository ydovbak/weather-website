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
    if(err){
        console.log("Something happened");
    } else {
        console.log("Success");
        console.log(response);

        //Filling in current weather into 
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
