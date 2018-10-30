const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();

const apiKey = '';

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true}));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
	res.render('index', {weather: null, error: null});
});

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
				let weatherText = `It is ${weather.main.temp} degrees in ${weather.name} with ${weather.weather[0].description}.`;
				res.render('index', {weather: weatherText, forecast: null, error: null});
			}
		}
	})
})

app.listen(3000, () => {
	console.log('Weathermabob listening on port 3000');
});
