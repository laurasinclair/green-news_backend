const router = require('express').Router();
const User = require('../models/User.model.js');
const mongoose = require('mongoose');

const apiKey = process.env.NYTIMES_API_TOKEN;
if (!apiKey) {
	throw new Error('API key not found');
}

router.get('/', (req, res) => {
	const page = parseInt(req.query.page) || 0;

	fetch(
		`https://api.nytimes.com/svc/search/v2/articlesearch.json?q=nature&fq='forests AND wildlife AND climate'&api-key=${apiKey}&page=${page}`
	)
		.then((resp) => {
			return resp.json();
		})
		.then((data) => {
			if (!data) throw new Error('Problem fetching from NY Times API');

			const articles = data.response.docs.slice(0, 9);
			const totalArticles = data.response.meta.hits;
			res.status(200).json({ articles, totalArticles });
		})
		.catch((error) => {
			console.log(error.message);
			res.status(500).send(error.message);
		});
});

router.get('/article=:articleSlug', (req, res) => {
	const { articleSlug } = req.params;
	const articleId = req.headers['article-id'];
	// console.log('Article ID:', articleId);

	fetch(
		`https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${articleId}&api-key=${apiKey}`
	)
		.then((resp) => {
			return resp.json();
		})
		.then((data) => {
			console.log(data);
			if (!data || !data.response)
				throw new Error('Problem fetching article from NY Times API');

			const article = data.response.docs;
			res.status(200).json({ article });
		})
		.catch((error) => {
			console.log(error.message);
			res.status(500).send(error.message);
		});
});

module.exports = router;
