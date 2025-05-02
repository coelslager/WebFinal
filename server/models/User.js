const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    auth: { type: String, enum: ['student', 'teacher'] },
    courses: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Course', // Assuming you have a Course model
        default: [] // Default to an empty array if not initialized
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;