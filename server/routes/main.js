const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User')

// Main Page Route (Home)
router.get('/', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');  // Redirect to login if not logged in
    }

    try {
        // Fetch all courses and populate the teacher's data (teacher_id field)
        const courses = await Course.find().populate('teacher_id', 'name'); // Populating teacher's name only

        const locals = {
            title: "All Courses", 
            activePage: "index",
            user: req.session.user,
            hideHeader : false
        };

        // Pass the courses with populated teacher data to the view
        res.render('index', { locals, data: courses });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error fetching courses');
    }
});


// Schedule Route (Example of another protected route)
router.get('/schedule', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');  // Redirect to login if not logged in
    }

    if (req.session.user.authType === "teacher") {
        return res.redirect('/');  // Redirect to home page if the user is a teacher
    }

    const studentId = req.session.user.id;  // Get the student's ID from the session

    try {
        // Step 1: Find the student by their ID
        const student = await User.findById(studentId).populate('courses');

        // Step 2: Check if the student is enrolled in any courses
        if (!student || student.courses.length === 0) {
            return res.render('schedule', {
                locals: {
                    title: "Schedule", 
                    activePage: "schedule",
                    user: req.session.user,
                    hideHeader: false
                },
                data: []  // No courses to show
            });
        }

        // Step 3: Populate teacher names from the Course model
        const courses = await Course.find({
            '_id': { $in: student.courses }  // Only fetch the courses the student is enrolled in
        }).populate('teacher_id', 'name');  // Populate the teacher's name

        const locals = {
            title: "Schedule", 
            activePage: "schedule",
            user: req.session.user,
            hideHeader: false
        };

        // Step 4: Render the page with the courses
        res.render('schedule', { locals, data: courses });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error fetching courses');
    }
});


// Instructor Route
router.get('/instructor', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');  // Redirect to login if not logged in
    }

    if (req.session.user.authType === "student"){
        return res.redirect('/');
    }

    //get array of current student's courses
    //get data for all courses with that course id
    try {
        const courses = await Course.find().populate('teacher_id', 'name');
        const locals = {
                title: "Instructor View", 
                activePage: "instructor",
                user: req.session.user,
                hideHeader : false
            };
        res.render('instructor', { locals, data : courses });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error fetching courses');
    }
});

router.get('/login', (req, res) => {
    const locals = {
        title: "Login",
        hideHeader : true
    };

    res.render('login', locals);
});

router.get('/newaccount', (req, res) => {
    const locals = {
        title: "New Account",
        hideHeader : true
    };

    res.render('newaccount', locals);
});

router.get('/newcourse', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    if (req.session.user.authType === "student") {
        return res.redirect('/');
    }

    const locals = {
        title: "New Course",
        hideHeader: false,
        user: req.session.user
    };

    res.render('newcourse', locals);
});


module.exports = router;
