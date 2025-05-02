const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const CourseSchema = new Schema({
    teacher_id: {type: mongoose.Types.ObjectId, ref: 'User', required: true},
    days: {type: String, required: true},
    times: {type: String, required: true},
    description: {type: String, required: true},
    course_name: {type: String, required: true},
    location: {type: String, required: true}
});

module.exports = mongoose.model('Course', CourseSchema, 'courses');