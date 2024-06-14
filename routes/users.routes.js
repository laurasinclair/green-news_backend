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
	const DBuserName = req.params.username;
	const userId = req.body.id;

	User.findByIdAndUpdate(userId, req.body)
		.then((updatedUser) => {
			res.status(201).json(updatedUser);
		})
		.catch((error) => {
			console.log(error)
			res.status(500).json({ error: 'Failed to update user info' });
		});
});

module.exports = router;
