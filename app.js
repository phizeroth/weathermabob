const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();

const apiKey = 'c252c0ddf26a962044ac300cd2525fdc';

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true}));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
	res.render('index', {weather: null, forecast: null, error: null});
});

let temps = [];
let conditions = [];

app.post('/', (req, res) => {
	let ZIP = req.body.ZIP;
	let urlCurrent = `https://api.openweathermap.org/data/2.5/weather?zip=${ZIP}&units=imperial&appid=${apiKey}`;
	let urlForecast = `https://api.openweathermap.org/data/2.5/forecast?zip=${ZIP}&units=imperial&appid=${apiKey}`;
	request(urlCurrent, (err, response, body) => {
		if (err) {
			res.render('index', {weather: null, forecast: null, error: 'Error, please try again'});
		} else {
			let weather = JSON.parse(body);

			if (weather.main == undefined) {
				res.render('index', {weather: null, forecast: null, error: 'Undefined, please try again'});
			} else {
				console.log(weather.main.temp);
				temps.push(weather.main.temp);
				//let weatherText = `It is ${weather.main.temp}º in ${weather.name} with ${weather.weather[0].description}.`;
				//res.render('index', {weather: weatherText, error: null});
			}
		}
	})
	
	.request(urlForecast, (err, response, body) => {
		if (err) {
			res.render('index', {forecast: null, weather: null, error: 'Error, please try again'});
		} else {
			let weather = JSON.parse(body);

			if (weather.list == undefined) {
				res.render('index', {forecast: null, weather: null, error: 'Undefined, please try again'});
			} else {
				console.log(weather.list[0].main.temp);
				for (let i = 0; i < 3; i++) {
					temps.push(weather.list[i].main.temp)
				}
			}
		}
	})
	console.log(temps);
	res.render(`Min temp: ${Math.min(...temps)}º\nMax temp: ${Math.max(...temps)}º`);

})

app.listen(3000, () => {
	console.log('Weathermabob listening on port 3000');
});
