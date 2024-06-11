const express = require('express');
const helmet = require("helmet");
const logger = require('morgan');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5005;
const apiKey = process.env.MONGODB_API_KEY;
const baseUrl = process.env.MONGODB_BASE_URL;
const username = process.env.MONGODB_USERNAME;
const pwd = process.env.MONGODB_PWD;
const dbUrl = process.env.MONGODB_DBURL;
const appName = process.env.MONGODB_APPNAME;

const app = express();

// MIDDLEWARE
app.use(helmet());
app.use(logger('dev'));

const corsOptions = {
	origin: '*',
	methods: ['GET', 'POST', 'PUT'],
	allowedHeaders: ['Content-Type', 'Authorization', 'api-key'],
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
	res.json('☀️');
});

const userRoutes = require("../routes/users.routes");
app.use("/users", userRoutes);

app.use("/api/articles", require("../routes/articles.routes"));


// Start the server
app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT} ✨`);
});

module.exports = app;