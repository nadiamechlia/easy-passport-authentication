const express = require('express');
const mongoose = require('mongoose');
const logger = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const dbConfig = require('./config/database');
const dotenv = require('dotenv');

// Server setup
const http = require('http');

// Use env variables
dotenv.config();

mongoose.connect(dbConfig.url, { useNewUrlParser: true }); // connect to db

// Initialize our express app
const app = express();

// Public folder
app.use(express.static(__dirname + '/public'));

//Passport
const passport = require('passport');
const flash = require('connect-flash');

// Log requests to the console
app.use(logger('dev'));

// Parse incomming requests data
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);

// Required for passport
app.use(
    session({
        secret: 'easy-passport-secret',
        name: 'passport-session',
        resave: true,
        saveUninitialized: true
    })
); // session secret

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./config/passport')(passport); // pass passport for configuration

// Set port
const port = parseInt(process.env.PORT, 10) || 8000;
app.set('port', port);

// Create server and lisen
const server = http.createServer(app);
server.listen(port);

// Routes
require('./server/routes')(app);

// Global route test
app.get('*', (req, res) => {
    res.status(200).send({
        message: 'Welcome to easy passport auth API!'
    })
});

// export app
module.exports = app;