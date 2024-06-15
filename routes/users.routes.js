const router = require('express').Router();
const User = require('../models/User.model.js');
const mongoose = require('mongoose');
const fileUploader = require('../config/cloudinary.config');

const apiKey = process.env.NYTIMES_API_TOKEN;
if (!apiKey) {
	throw new Error('API key not found');
}

router.get('/', (req, res) => {
	User.find()
		.then((allUsers) => {
			console.log('🟢 Users found'), res.status(200).json(allUsers);
		})
		.catch((error) => {
			console.error('🔴 Failed to display user', error);
			res.status(500).json({ error: '🔴 Failed to display user' });
		});
});

router.put('/', (req, res) => {
	User.create(req.body)
		.then((updatedUser) => {
			res.status(200).json(updatedUser);
		})
		.catch((error) => {
			console.log(error);
			res.status(500).json({ error: 'Failed to create user' });
		});
});

router.get('/:username', (req, res) => {
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

router.put('/:username', (req, res) => {
	const userId = req.body._id;

	User.findByIdAndUpdate(userId, req.body)
		.then((updatedUser) => {
			res.status(200).json(updatedUser);
		})
		.catch((error) => {
			console.log(error);
			res.status(500).json({ error: 'Failed to update user info' });
		});
});

router.post('/:username/upload', fileUploader.single('file'), (req, res, next) => {
	console.log('file is: ', req.file);

	if (!req.file) {
		next(new Error('No file uploaded!'));
		return;
	}
	res.status(200).json({ fileUrl: req.file.path });
});

router.get('/:username/savedarticles', (req, res) => {
	const { username } = req.params;

	User.findOne({ 'userInfo.username': username })
		.then((user) => {
			const savedArticles = user.userInfo.savedArticles;

			const fetchArticles = async () => {
				try {
					const responses = await Promise.all(
						savedArticles.map((articleID) =>
							fetch(
								`https://api.nytimes.com/svc/search/v2/articlesearch.json?fq=uri:"${articleID}"&api-key=${apiKey}`
							)
								.then((response) => response.json())
								.catch((error) => console.log(error))
						)
					);

					if (responses[0].fault && responses[0].fault.faultstring) {
						throw new Error(responses[0].fault.faultstring);
					}

					// res.status(200).json([...responses.docs]);
					// res.status(200).json(responses);
				} catch (error) {
					console.error({ 'Error fetching articles': error });
					res
						.status(500)
						.json({ message: 'Error fetching articles: ' + error.message });
				}
			};

			fetchArticles();
		})
		.catch((error) => {
			console.error(error);
			res.status(500).json(`Failed to find user ${username}`);
		});
});

router.put('/:username/savedarticles', (req, res) => {
	const { userId, articleId, action } = req.body;

	let updateQuery = {};
	let updateMessage = '';

	if (action === 'add') {
		updateMessage = `Article ${articleId} successfully saved`;
		updateQuery = {
			$addToSet: { 'userInfo.savedArticles': articleId },
		};
	} else if (action === 'remove') {
		updateMessage = `Article ${articleId} successfully removed`;
		updateQuery = {
			$pull: { 'userInfo.savedArticles': articleId },
		};
	} else {
		return res.status(400).json({ error: 'Invalid action' });
	}

	User.findByIdAndUpdate(userId, updateQuery, { new: true })
		.then((updatedUser) => {
			// console.log(updatedUser)
			res.status(200).json({
				message: updateMessage,
				savedArticles: updatedUser.userInfo.savedArticles,
			});
		})
		.catch((error) => {
			console.log(error);
			res.status(500).json({ error: 'Failed to update user info' });
		});
});

module.exports = router;
