"use strict";
const ApiKey = 'f4a88f380ea81884743aec0bbf45f133';
let tabId = 0;        //Variable for saving what day tab is clicked
let weekDates = [];
let forecastList;

const $ = (selector) => document.querySelector(selector);

window.onload = () => {
    const tabs = document.querySelectorAll(".nav-link");
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener('click', (event) => {
            tabId = i;
            console.log('clicked' + i);
            fillHourlyBreakdown();
        });
    }

    // const lat = 48.154890;
    // const lon = 23.134630;

    navigator.geolocation.getCurrentPosition((pos) => {
        console.log(pos.coords);
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        getForecast5days(lat, lon, 'metric', handleForecastResponseCallback);
        getOneApiCall(lat, lon, 'metric', handleOneCallForecast);

        // initialise leaflet maps
        const map = L.map('mapid').setView([lat, lon], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        //getForecast5days(lat, lon, 'metric', handleForecastResponseCallback);
        //getOneApiCall(lat, lon, 'metric', handleOneCallForecast);
    }, err => {
        alert('could not determine geo location, please enter your city');
        console.error(err);
    });

};



const handleOneCallForecast = (err, response) => {
    if (err) {
        console.log("Something happened");
    } else {
        console.log(response);
        fillMainWeatherPanel(response);
        fillWeeklyWeatherPanel(response);

    }
};

const handleForecastResponseCallback = (err, response) => {
    if (err) {
        alert('Something happened');
    } else {
        const city = response.city;
        $('#city-name').innerText = city.name;
        console.log(response);
        fillHourlyBreakdownPanel(response);
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
};

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
};

const fillMainWeatherPanel = (response) => {
    $('#temperature').innerHTML = parseInt(response.current.temp) + " &#8451;";
    $('#feels-like').innerHTML += " " + parseInt(response.current.feels_like) + '&#8451';
    $('#humidity').innerText += " " + response.current.humidity + " %";
    $('#wind-speed').innerText += " " + response.current.wind_speed + " m/s";
    $('#wind-dir').innerText += " " + getCardinalDirectionAndArrow(response.current.wind_deg);
    $('#uv-index').innerText += " " + response.current.uvi;
    $('#clouds').innerText += response.current.clouds + " %";
    $('#pressure').innerText += " " + (response.current.pressure / 100) + " mb"; //Converting pressure from hpa to mb
    $('#visibility').innerText += " " + parseInt(response.current.visibility / 1000) + " km"; //Visibility is given in meters in API, converting to km
    $('#weather-icon').src = `https://openweathermap.org/img/wn/${response.current.weather[0].icon}@4x.png`;
};

const fillWeeklyWeatherPanel = (response) => {
    //First saving all the information about weekly forecast into an array
    const days = response.daily.slice(0, -1);
    let html = "";

    for (let day of days) {
        let date = new Date(day.dt * 1000);         //Converting seconds into miliseconds and into Date object
        html += `<div class="col"><p>${getNameOfDay(date.getDay())}</p>
            <p>${date.getDate()}.${date.getMonth() + 1}</p>
            <p><img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png"></p>
            <h3>${parseInt(day.temp.max)} &deg; <span class="text-muted">${parseInt(day.temp.min)} &deg;</span></h3>
            <p>${day.weather[0].description}</p></div>`;
    }
    $("#weekly-panel").innerHTML = html;
};

const fillHourlyBreakdownPanel = (response) => {
    setTabsNames(response.list[0].dt);
    forecastList = response.list;
    fillHourlyBreakdown();
}

const fillHourlyBreakdown = () => {
    let htmlOutput = "";
    console.log(forecastList);
    for (let forecast of forecastList) {
        let date = new Date(forecast.dt * 1000);
        //Check if the tab chosen by user corresponds to datetime of forecast

        if (weekDates[tabId].getDay() == date.getDay()) {
            //Writing to the table
            htmlOutput += `<div class="col"><p> <span class='brand-line'>${date.getHours()}:00</span></p>
                <p class='my-2 py-2 temp-text'>${Math.round(forecast.main.temp)} &deg; <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" width='40px' hight='40px'></p>
                <p class='pb-1 mb-0'><i class="fas fa-cloud brand-color"></i> ${forecast.clouds.all}%</p>
                <p class='py-1 my-0'><i class="fas fa-tint brand-color"></i> ${forecast.main.humidity}%</p>
                <p class='py-1 my-0'><i class="fas fa-stopwatch brand-color"></i> ${forecast.main.pressure/100} mb</p>
                <p class='pt-1 mt-0'> <span class='brand-color'>${ getCardinalArrow(forecast.wind.deg)}</span> ${forecast.wind.speed} m/s</p>
                </div>` ;
        }
        $('#daily-panel').innerHTML = htmlOutput;
    }
}

//Set days of the tabs corresponding to API response data available
//datetime - is the first datetime available in the response list
const setTabsNames = (datetime) => {
    let firstDate = new Date(datetime * 1000);
    weekDates.push(firstDate);

    $('#tab-1').innerText = getNameOfDay(firstDate.getDay());

    //Figure out consequent days ans set appropriate tab names
    const secondDate = new Date(firstDate.getTime() + 86400000);
    $('#tab-2').innerText = getNameOfDay(secondDate.getDay());
    weekDates.push(secondDate);

    const thirdDate = new Date(secondDate.getTime() + 86400000);
    $('#tab-3').innerText = getNameOfDay(thirdDate.getDay());
    weekDates.push(thirdDate);

    const fourthDate = new Date(thirdDate.getTime() + 86400000);
    $('#tab-4').innerText = getNameOfDay(fourthDate.getDay());
    weekDates.push(fourthDate);

    const fifthDate = new Date(fourthDate.getTime() + 86400000);
    $('#tab-5').innerText = getNameOfDay(fifthDate.getDay());
    weekDates.push(fifthDate);
}
