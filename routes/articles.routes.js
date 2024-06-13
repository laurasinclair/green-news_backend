const router = require('express').Router();
const User = require('../models/User.model.js');
const mongoose = require('mongoose');

router.get('/', (req, res) => {
	const apiKey = process.env.NYTIMES_API_TOKEN;
	if (!apiKey) {
		throw new Error('API key not found');
	}

	const page = parseInt(req.query.page) || 0;

	fetch(
		`https://api.nytimes.com/svc/search/v2/articlesearch.json?q=nature&fq='forests AND wildlife AND climate'&api-key=${process.env.NYTIMES_API_TOKEN}&page=${page}`
	)
		.then((resp) => {
			return resp.json();
		})
		.then((data) => {
			if (!data) throw new Error('Problem fetching from NY Times API');

			const articles = data.response.docs;
			const totalArticles = data.response.meta.hits;
			res.status(200).json({ articles, totalArticles });
		})
		.catch((error) => {
			console.log(error.message);
			res.status(500).send(error.message);
		});
});

module.exports = router;
