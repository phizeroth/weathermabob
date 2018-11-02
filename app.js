const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

const apiKey = 'c252c0ddf26a962044ac300cd2525fdc';

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
		let weatherText = `Max temp: ${Math.round(Math.max(...temps))} °F<br />
						   Min temp: ${Math.round(Math.min(...temps))} °F<br />
						   Conditions: ${conditions.join(' | ')}`;
		res.render('index', {weather: weatherText, error: null});
	}).catch((e) => {
		console.log(e);
	})
})

app.listen(3000, () => {
	console.log('Weathermabob listening on port 3000');
});
