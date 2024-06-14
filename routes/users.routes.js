const router = require('express').Router();
const User = require('../models/User.model.js');
const mongoose = require('mongoose');

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

router.put('/:username/savedarticles', (req, res) => {
	const { userId, articleId, action } = req.body;

	let updateQuery = {};
	let updateMessage = '';

	if (action === 'add') {
		updateMessage = `Article ${articleId} successfully saved`
		updateQuery = {
			$addToSet: { 'userInfo.savedArticles': articleId },
		};
	} else if (action === 'remove') {
		updateMessage = `Article ${articleId} successfully removed`
		updateQuery = {
			$pull: { 'userInfo.savedArticles': articleId },
		};
	} else {
		return res.status(400).json({ error: 'Invalid action' });
	}

	User.findByIdAndUpdate(userId, updateQuery, { new: true })
		.then((updatedUser) => {
			// console.log(updatedUser)
			res
				.status(200)
				.json({
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
