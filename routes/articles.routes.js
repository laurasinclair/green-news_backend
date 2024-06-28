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

router.get('/article=:articleSlug', (req, res) => {
	const { articleSlug } = req.params;

	if (!articleSlug || articleSlug === undefined) {
		res.status(404).json({ message: 'No article slug' });
		return;
	}

	fetch(
		`https://api.nytimes.com/svc/search/v2/articlesearch.json?fq=headline:'${articleSlug}'&api-key=${apiKey}`
	)
		.then((resp) => {
			return resp.json();
		})
		.then((data) => {
			console.log(data.response)
			if (!data || !data.response.docs || data.response.docs.length === 0) {
				return new Error({
					message: 'Problem fetching article from NY Times API',
				});
			}

			const article = { ...data.response.docs[0] };
			console.log(data.response.docs[0])
			res.status(200).json({
				message: `Article ${articleSlug} found!`,
				article: article,
			});
		})
		.catch((error) => {
			console.log(error.message);
			res.status(500).send(error.message);
		});
});

module.exports = router;
