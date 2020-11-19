//This array is used for converting number of day from Date class into string day
const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday",  "Thursday", "Friday", "Saturday"];

function Forecast(temp, clouds, icon, humidity, preassure, windDeg, windSpeed, time) {
    this.temp = temp;
    this.clouds = clouds;
    this.icon = icon;
    this.humidity = humidity;
    this.preassure = preassure;
    this.windDeg = windDeg;
    this.windSpeed = windSpeed;
    this.time = time;

}

function getCardinalDirectionAndArrow(angle) {
    const directions = ['↑ N', '↗ NE', '→ E', '↘ SE', '↓ S', '↙ SW', '← W', '↖ NW'];
    return directions[Math.round(angle / 45) % 8];
}

function getCardinalArrow(angle) {
    const directions = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
    return directions[Math.round(angle / 45) % 8];
}

// This method translates the index of the tay into ordinary name
// like Monday, Tuesday etc
function getNameOfDay(day) {
    //Checking for todays and tomorrows day
    const today = new Date(Date.now());
    if (today.getDay() == day){
        return "Today";
    } else if ( (today.getDay()) == day){
        return "Tomorrow";
    }

    return weekday[day];
}

