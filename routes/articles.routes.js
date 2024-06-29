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
			if (!data || !data.response.docs || data.response.docs.length === 0) {
				throw new Error({ message: 'Problem fetching from NY Times API' });
			}

			const articles = data.response.docs.slice(0, 9);
			const totalArticles = data.response.meta.hits;
			res.status(200).json({ articles, totalArticles });
		})
		.catch((error) => {
			console.log(error.message);
			res.status(500).send(error.message);
		});
});

router.get('/:articleSlug', (req, res) => {
	const articleId = 'nyt://article/' + req.query.id;
	console.log(articleId);

	if (!articleId || articleId == undefined) {
		res.status(404).json({ message: 'No article ID' });
		return;
	}
	fetch(
		`https://api.nytimes.com/svc/search/v2/articlesearch.json?q=_id:"${articleId}"&api-key=${apiKey}`
	)
		.then((resp) => {
			return resp.json();
		})
		.then((data) => {
			console.log(data);

			if (!data || data.status === 'ERROR') {
				throw new Error({
					message: 'Problem fetching article from NY Times API',
				});
			}
			if (data.status === 'OK' && data.response.meta.hits > 0) {
				const article = { ...data.response.docs };
				res.status(200).json({
					message: `Article ${articleId} found!`,
					article: article,
				});
			}
		})
		.catch((error) => {
			console.log(error.message);
			res.status(500).send(error.message);
		});
});

module.exports = router;
