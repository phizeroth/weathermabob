require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
	res.render('index', { weather: null, error: null });
});

app.post('/', (req, res) => {
	let ZIP = req.body.ZIP;
	let urlCurrent = `https://api.openweathermap.org/data/2.5/weather?zip=${ZIP}&units=imperial&appid=${process.env.OPENWEATHERMAP_KEY}`;
	let urlForecast = `https://api.openweathermap.org/data/2.5/forecast?zip=${ZIP}&units=imperial&appid=${process.env.OPENWEATHERMAP_KEY}`;

	let temps = [];
	let conditions = [];

	axios.get(urlCurrent).then((response) => {
		temps.push(response.data.main.temp);
		console.log(temps);
		return axios.get(urlForecast);
	}).then((response) => {
		console.log(response.data.cod);
		for (let i = 0; i < 3; i++) {
			temps.push(response.data.list[i].main.temp);
			conditions.push(response.data.list[i].weather[0].description);
			console.log(temps);
			console.log(conditions);
		}
		maxTemp = Math.round(Math.max(...temps));
		minTemp = Math.round(Math.min(...temps));
		let weatherText = `Max temp: ${maxTemp} °F<br />
						   Min temp: ${minTemp} °F<br />
						   Conditions: ${conditions.join(' | ')}`;
		res.render('index', { weather: weatherText, error: null });
		return axios.post('https://api.thingspeak.com/update.json', {
			"api_key": process.env.THINGSPEAK_KEY_WRITE,
			"field1": maxTemp,
			"field2": conditions[0],
			"field3": minTemp
		});
	}).then((response) => {
		if (response.status === 200) {
			console.log('Success!');
		}
	}).catch((e) => {
		console.log(e);
	})
})

app.listen(port, () => {
	console.log('Weathermabob listening on port ' + port);
});
