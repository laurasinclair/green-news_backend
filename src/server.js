const express = require('express');
const logger = require('morgan');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.model');

const PORT = process.env.PORT || 5005;
const apiKey = process.env.MONGODB_API_KEY;
const baseUrl = process.env.MONGODB_BASE_URL;
const username = process.env.MONGODB_USERNAME;
const pwd = process.env.MONGODB_PWD;
const dbUrl = process.env.MONGODB_DBURL;
const appName = process.env.MONGODB_APPNAME;

const app = express();

// MIDDLEWARE
app.use(logger('dev'));

const corsOptions = {
	origin: '*',
	methods: ['GET', 'POST', 'PUT'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
// app.use(cors());

app.use(express.static('public'));
app.use(express.json());

// Iteration 1 - Connect to MongoDB
// DATABASE CONNECTION

const MONGODB_URI = `mongodb+srv://${username}:${pwd}@${dbUrl}/?retryWrites=true&w=majority&appName=${appName}`;

mongoose
	.connect(MONGODB_URI, { dbName: 'users' })
	.then((x) =>
		console.log(
			`Connected to Mongo! Database name: "${x.connections[0].name}"`
		)
	)
	.catch((err) => console.error('Error connecting to mongo', err));

// ROUTES
app.get('/', (req, res, next) => {
	res.json('All good in here');
});

app.get('/users', (req, res) => {
	User.find()
		.then((allUsers) => {
			console.log('🟢 Users found'), res.status(200).json(allUsers);
		})
		.catch((error) => {
			console.error('🔴 Failed to display user', error);
			res.status(500).json({ error: '🔴 Failed to display user' });
		});
});

app.get('/users/:username', (req, res) => {
	const DBuserName = req.params.username;

	User.findOne({ 'userInfo.username': DBuserName })
		.then((user) => {
			res.status(200).json(user);
		})
		.catch((error) => {
			console.error('Failed to find user ' + DBuserName);
			res.status(500).json(`Failed to find user ${DBuserName}`);
		});
});

// Start the server
app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT} ✨`);
});

//❗️DO NOT REMOVE THE BELOW CODE
module.exports = app;
