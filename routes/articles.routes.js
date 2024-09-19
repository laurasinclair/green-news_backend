const router = require('express').Router();
const User = require('../models/User.model.js');
const mongoose = require('mongoose');

const API_KEY = process.env.NYTIMES_API_TOKEN;
if (!API_KEY) {
	throw new Error('API key not found');
}

router.get('/', async (req, res) => {
	const page = parseInt(req.query.page) || 0;

	const response = await fetch(
		`https://api.nytimes.com/svc/search/v2/articlesearch.json?q=nature&fq='forests AND wildlife AND climate'&api-key=${API_KEY}&page=${page}`,
		{
			headers: {
				'api-key': API_KEY,
			},
		}
	);

	const data = await response.json();

	if (response.statusText !== 'OK') {
		throw new Error({ message: 'Problem fetching from NY Times API' });
	}

	const articles = data.response.docs.slice(0, 9);
	const totalArticles = data.response.meta.hits;

	res.status(response.status).json({ articles, totalArticles });
});

router.get('/:articleSlug', (req, res) => {
	const articleId = 'nyt://article/' + req.query.id;
	// console.log(articleId);

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
			// console.log(data);

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
			console.error(error.message);
			res.status(500).send(error.message);
		});
});

module.exports = router;
