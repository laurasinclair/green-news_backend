const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    'userInfo': {
        'username': {type: String, required: true},
        'firstName': {type: String, required: true},
        'lastName': {type: String, required: true},
        'savedArticles': {
            'articleId': {type: String, required: true},
            'articleTitle': {type: String, required: true}
        },
        'profilePicture': String
    }
})

const UserModel = mongoose.model("User", userSchema)
module.exports = UserModel