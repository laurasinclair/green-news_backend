const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    'userInfo': {
        'username': {type: String, required: true},
        'firstName': {type: String, required: true},
        'lastName': {type: String, required: true},
        'savedArticles': {type: Array},
        'profilePicture': String
    }
})

const UserModel = mongoose.model("User", userSchema)
module.exports = UserModel