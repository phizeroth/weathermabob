require('dotenv').config();

const axios = require('axios');

const ZIP = process.argv[2];
const urlCurrent = `https://api.openweathermap.org/data/2.5/weather?zip=${ZIP}&units=imperial&appid=${process.env.OPENWEATHERMAP_KEY}`;
const urlForecast = `https://api.openweathermap.org/data/2.5/forecast?zip=${ZIP}&units=imperial&appid=${process.env.OPENWEATHERMAP_KEY}`;

const interval = 30000;

let tempsPrevious = [];
let conditionsPrevious = [];

function axiosWeatherUpdate() {
	let temps = [];
	let conditions = [];
	axios.get(urlCurrent).then((response) => {
		temps.push(response.data.main.temp);
		return axios.get(urlForecast);
	}).then((response) => {
		console.log('Status: ' + response.data.cod);
		for (let i = 0; i < 3; i++) {
			temps.push(response.data.list[i].main.temp);
			conditions.push([response.data.list[i].weather[0].icon, response.data.list[i].weather[0].description]);
		}
        console.log(temps);
		console.log(conditions);
		if (arrayEquals(temps, tempsPrevious) && arrayEquals(conditions, conditionsPrevious)) {
			throw Date() + ' | No changes...';
		}
		tempsPrevious = temps;
		conditionsPrevious = conditions;
		maxTemp = Math.round(Math.max(...temps));
		minTemp = Math.round(Math.min(...temps));
        console.log(`========================`,
		`\nCity: ${response.data.city.name}, ${ZIP} | ${response.data.city.country}`,
		`\nMax temp: ${maxTemp} °F`,
		`\nMin temp: ${minTemp} °F`,
		`\nConditions: ${conditions.join(' | ')}`,
		`\n========================`);
		
		return axios.post('https://api.thingspeak.com/update.json', {
			"api_key": process.env.THINGSPEAK_KEY_WRITE,
			"field1": maxTemp,
			"field2": conditions[0][0],
			"field3": minTemp
		});
	}).then((response) => {
		if (response.status === 200) {
			console.log(Date() + ' | Posted to ThingSpeak: Success!');
		}
	}).catch((e) => {
		console.error(e);
    })
    
    setTimeout(axiosWeatherUpdate, interval);
}

axiosWeatherUpdate();

function arrayEquals(arr1, arr2) {
	return JSON.stringify(arr1) === JSON.stringify(arr2);
}