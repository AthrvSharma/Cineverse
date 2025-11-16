const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: false // Not required for OAuth users
    },
    googleId: {
        type: String
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    // **NEW FEATURE: User-specific movie list**
    myList: {
        type: [String],
        default: []
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;

