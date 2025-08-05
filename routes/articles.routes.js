const router = require('express').Router();
const User = require('../models/User.model.js');
const mongoose = require('mongoose');

const API_KEY = process.env.NYTIMES_API_TOKEN;
if (!API_KEY) {
	throw new Error('API key not found');
}

router.get('/', async (req, res) => {
	const page = parseInt(req.query.page) || 1;

	const response = await fetch(
		`https://api.nytimes.com/svc/search/v2/articlesearch.json?q=nature&fq='forests AND wildlife AND climate'&api-key=${API_KEY}&page=${page}`,
		{
			headers: {
				'api-key': API_KEY,
			},
		}
	);

	const data = await response.json();

	if (response.status !== 200) {
		return res.status(response.status).json({ message: response.statusText });
	}

	const articles = data.response.docs.slice(0, 9);
	const totalArticles = data.response.metadata.hits;
	res.status(response.status).json({ articles, totalArticles });
});

const BASE_URL = 'https://api.nytimes.com/svc/search/v2/articlesearch.json';

router.post('/article', async (req, res) => {
	const { articleId } = req.body;
	const fullArticleId = `nyt://article/${articleId}`;

	if (!articleId) {
		return res.status(500).json({ message: 'No article ID' });
	}

	const url = `${BASE_URL}?fq=_id:"${fullArticleId}"&api-key=${API_KEY}`;
	const response = await fetch(url);

	const data = await response.json();

	if (response.statusText !== 'OK') {
		return res
			.status(response.status)
			.json({ message: 'Problem fetching article from NY Times API' });
	}
	
	if (data.response.metadata.hits < 1) return res.status(404).json({ message: "No article was found" });
	if (data.response.metadata.hits > 1) return res.status(422).json({ message: "Too many articles were found" });

	const article = { ...data.response.docs };
	res.status(200).json({
		message: `Article ${articleId} found!`,
		article: article[0],
	});
});

module.exports = router;
