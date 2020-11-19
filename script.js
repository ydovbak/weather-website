"use strict";
const ApiKey = 'f4a88f380ea81884743aec0bbf45f133';
let lat;
let lon;
let tabId = 0;              // the index of day tab that was clicked
let unit = 'metric';        // measurement units of the web page         
let temp = "&deg;C";        // format of temperature output (C/F)
let distance = "m";         // format of the distance output (meters/miles)

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

    navigator.geolocation.getCurrentPosition((pos) => {
        console.log(pos.coords);
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;

        getForecast5days(lat, lon, unit, handleForecastResponseCallback);
        getOneApiCall(lat, lon, unit, handleOneCallForecast);

        // initialise leaflet maps
        const map = L.map('mapid').setView([lat, lon], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

    }, err => {
        alert('could not determine geo location, please enter your city');
        console.error(err);
    });

    // Imperial - Metric Click listeners 
    $("#imperial").addEventListener('click', () => {
        //Check if units should be changed
        if (unit == "metric") {
            $('#dropdown').innerText = "Imperial";
            unit = "imperial";
            
            //Resetting Units
            temp = "&deg;F";
            distance = "ml";

            //Resetting the data
            updateData(lat, lon, unit);  
        }

    })

    $("#metric").addEventListener('click', () => {
        if (unit == "imperial") { 
            $('#dropdown').innerText = "Metric";
            unit = "metric";
            
            //Resetting units
            temp = "&deg;C";
            distance = "m";

            //Resetting the data
            updateData(lat, lon, unit);
        }
    })
};

const handleOneCallForecast = (err, response) => {
    if (err) {
        console.log("Something happened");
    } else {
        fillMainWeatherPanel(response);
        fillWeeklyWeatherPanel(response);
        console.log(response);
    }
};

const handleForecastResponseCallback = (err, response) => {
    if (err) {
        alert('Something happened');
    } else {
        const city = response.city;
        $('#city-name').innerText = city.name;
        console.log(response);
        fillThreeHourBreakdownPanel(response);
    }
};

const getOneApiCall = (lat, lon, unit, callback) => {
    const parts = 'minutely,hourly,alerts';
    const URL = `https://api.openweathermap.org/data/2.5/onecall?units=${unit}&lat=${lat}&lon=${lon}&exclude=${parts}&appid=${ApiKey}`;
    ajaxGetRequest(URL, callback);
};

const getForecast5days = (lat, lon, unit, callback) => {
    const URL = `https://api.openweathermap.org/data/2.5/forecast?&units=${unit}&lat=${lat}&lon=${lon}&appid=${ApiKey}`;
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

const updateData = (lat, lon, unit) => {
    //Making API calls with new parameters
    getForecast5days(lat, lon, unit, handleForecastResponseCallback);
    getOneApiCall(lat, lon, unit, handleOneCallForecast); 
};

// Filling data about current weather into front panel shown to user
const fillMainWeatherPanel = (currWeather) => {
    $('#temperature').innerHTML = parseInt(currWeather.current.temp) + " " +  temp;
    $('#feels-like').innerHTML = " " + parseInt(currWeather.current.feels_like) + " " +  temp;
    $('#humidity').innerText = " " + currWeather.current.humidity + " %";
    $('#wind-speed').innerText = " " + currWeather.current.wind_speed + " " + distance + "/s";
    $('#wind-dir').innerText = " " + getCardinalDirectionAndArrow(currWeather.current.wind_deg);
    $('#uv-index').innerText = " " + currWeather.current.uvi;
    $('#clouds').innerText = currWeather.current.clouds + " %";
    $('#pressure').innerText = " " + (currWeather.current.pressure / 100) + " mb"; //Converting pressure from hpa to mb
    $('#weather-icon').src = `https://openweathermap.org/img/wn/${currWeather.current.weather[0].icon}@4x.png`;

    //Setting visibility distance
    if (unit == "metric") {
        //Visibility is given in meters in API, converting to km
        $('#visibility').innerText = " " + (parseInt(currWeather.current.visibility)/1000) + " km";
    } else {
        $('#visibility').innerText = " " + currWeather.current.visibility + " miles";
    }
};

// Filling data in a form of 3 hour forecast for next 5 days
const fillThreeHourBreakdownPanel = (response) => {
    const weekDates = setTabsNames(response.list[0].dt);
    const forecastThreeHoursList = response.list;
    fillHourlyBreakdown(weekDates, forecastThreeHoursList);
}   

const fillHourlyBreakdown = (weekDates, forecastThreeHoursList) => {
    let htmlOutput = "";
    for (let forecast of forecastThreeHoursList) {
        let date = new Date(forecast.dt * 1000);

        //Check if the tab chosen by user corresponds to datetime of forecast
        if (weekDates[tabId].getDay() == date.getDay()) {
            //Writing to the table
            htmlOutput += `<div class="col"><p> <span class='brand-line'>${date.getHours()}:00</span></p>
                <p class='my-2 py-2 temp-text'>${Math.round(forecast.main.temp)} ${temp} <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" width='40px' hight='40px'></p>
                <p class='pb-1 mb-0'><i class="fas fa-cloud brand-color"></i> ${forecast.clouds.all}%</p>
                <p class='py-1 my-0'><i class="fas fa-tint brand-color"></i> ${forecast.main.humidity}%</p>
                <p class='py-1 my-0'><i class="fas fa-stopwatch brand-color"></i> ${forecast.main.pressure / 100} mb</p>
                <p class='pt-1 mt-0'> <span class='brand-color'>${getCardinalArrow(forecast.wind.deg)}</span> ${forecast.wind.speed} ${distance}/s</p>
                </div>` ;
        }
        $('#daily-panel').innerHTML = htmlOutput;
    }
}

const fillWeeklyWeatherPanel = (response) => {
    //Next seven days forecast is giving us records of weather forecast for today AND next 7 days
    //which is 8 days in total. We want to show weekly forecast for today and next 6 days, therefore
    //using slice() metod we get rid of an extra day
    let sevenDaysWeather = response.daily.slice(0, -1);
    let html = "";

    for (let day of sevenDaysWeather) {
        let date = new Date(day.dt * 1000);         //Converting seconds into miliseconds and into Date object
        html += `<div class="col"><p>${getNameOfDay(date.getDay())}</p>
            <p>${date.getDate()}.${date.getMonth() + 1}</p>
            <p><img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png"></p>
            <h3>${parseInt(day.temp.max)}${temp} <span class="text-muted">${parseInt(day.temp.min)}${temp}</span></h3>
            <p>${day.weather[0].description}</p></div>`;
    }
    $("#weekly-panel").innerHTML = html;
};



//Set days of the tabs corresponding to API response data available
//datetime - is the first datetime available in the response list
const setTabsNames = (datetime) => {
    let weekDates = [];
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

    return weekDates;
}
