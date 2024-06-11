const router = require('express').Router();
const User = require('../models/User.model.js');
const mongoose = require('mongoose');

router.get('/', (req, res) => {
	const apiKey = process.env.NYTIMES_API_TOKEN;
	if (!apiKey) {
		throw new Error('API key not found');
	}
	
	try {
		fetch(
			`https://api.nytimes.com/svc/search/v2/articlesearch.json?q=nature&api-key=${process.env.NYTIMES_API_TOKEN}`
		)
			.then((resp) => resp.json())
			.then((data) => {
				res.status(200).json(data.response);
			})
			.catch((error) => {
				console.error(error);
				res.status(500).send('Error fetching articles');
			});
	} catch (error) {
		console.error(error);
	}
});

module.exports = router;
