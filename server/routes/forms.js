const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/User');
const Course = require('../models/Course');

// Register Route (create new user)
router.post('/register', async (req, res) => {
    const { name, email, password, confirmPassword, userType } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const authType = userType === 'Student' ? 'student' : 'teacher';

        await User.create({
            auth: authType,
            name,
            email,
            password: hashedPassword
        });

        res.redirect('/login');
    } catch (error) {
        console.log(error);
        res.status(500).send('Error creating account');
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send('Incorrect Email or Password');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(400).send('Incorrect Email or Password');
        }

        req.session.user = {
            id: user._id,
            name: user.name,
            authType: user.auth
        };

        res.redirect('/'); // Redirect to the home page
    } catch (error) {
        console.log(error);
        res.status(500).send('Login failed');
    }
});

router.get('/logout', (req, res)=>{
    req.session.destroy(err => {
        if (err){
            console.log(err);
            return res.status(500).send("Logout failed");
        }
        res.redirect('/login');
    })
});

router.post('/add-course', async (req, res) => {
    const { studentId, courseId } = req.body;

    try {
        const student = await User.findById(studentId);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Prevent adding the same course more than once
        if (student.courses.includes(courseId)) {
            return res.status(400).json({ message: 'Course already added' });
        }

        student.courses.push(courseId);
        await student.save();

        res.status(200).json({ message: 'Course added successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error adding course' });
    }
});

router.post('/leave-course', async (req, res) => {
    const { studentId, courseId } = req.body;
    console.log(studentId);
    console.log(courseId);

    try {
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Convert courseId to ObjectId
        const objectId = new mongoose.Types.ObjectId(courseId);

        // Remove the course from the courses array
        student.courses = student.courses.filter(
            course => !course.equals(objectId)
        );

        // Save the updated student
        await student.save();

        res.status(200).json({ message: 'Course removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error removing course' });
    }
});

router.post('/new-course', async (req, res) =>{
    const { courseName, description, days, time, location } = req.body;

    try {
        const teacher = await User.findById(req.session.user.id);

        const newCourse = await Course.create({
            teacher_id: req.session.user.id,
            days: days,
            times: time,
            description: description,
            course_name: courseName,
            location: location
        });

        teacher.courses.push(newCourse._id);
        await teacher.save();

        res.redirect('/instructor');
    } catch (error) {
        console.log(error);
        res.status(500).send('Error creating course');
    }
});

router.post('/delete-course', async (req, res) => {
    const { teacherId, courseId } = req.body;
    const objectId = new mongoose.Types.ObjectId(courseId);

    try {
        // Find all users and remove the course from each user's courses array
        const users = await User.find();

        // Use Promise.all to ensure all users' saves are completed
        const userUpdatePromises = users.map(async (singleUser) => {
            // Remove the course from the user's courses array
            const originalCoursesLength = singleUser.courses.length;
            singleUser.courses = singleUser.courses.filter(course => !course.equals(objectId));
            const newCoursesLength = singleUser.courses.length;

            // Save the updated user
            return singleUser.save();
        });

        // Await all user saves
        await Promise.all(userUpdatePromises);

        // Now, delete the course from the Course collection
        const deletedCourse = await Course.deleteOne({ _id: objectId });

        res.status(200).json({ message: 'Course removed successfully' });

    } catch (error) {
        console.error("Error during deletion:", error);
        res.status(500).json({ message: 'Error removing course' });
    }
});



module.exports = router;
