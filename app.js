require('dotenv').config(); //use .env file

const express = require('express');
const expressLayout = require('express-ejs-layouts');

const connectDB = require('./server/config/db')

const app = express();
const PORT = 3000 || process.env.PORT;

const session = require('express-session');

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24} // 1 day
}));

//connect to DB
connectDB();

//be able to collect data
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(express.static('public'));

//templating engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/forms'));

app.listen(PORT, ()=>{
    console.log(`App listening on port ${PORT}`);
})