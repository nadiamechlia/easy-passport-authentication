const passport = require('passport');
const User = require('../models/user.model');

module.exports = (app) => {
    // ******** Views routes ******** //
    app.get('/', (req, res) => {
        res.render('index.ejs')
    });

    app.get('/profile', (req, res) => {
        res.render('profile.ejs', {
            user: req.user
        })
    })

    // ******** Authentificatoin ******** //
    // *** Local login *** //
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile',
        failureRedirect: '/',
        failureFlash: true
    }))

    // *** Local signup *** //
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
    }));

    // *** Facebook *** //
    // Send to facebook to do the authentication
    app.get('/auth/facebook', passport.authenticate('facebook', {
        scope: ['public_profile', 'email']
    }));

    // Handle the callback
    app.get('/api/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    // *** Google *** //
    // Send to google to do the authentication
    app.get('/auth/google', passport.authenticate('google', {
        scope: ['profile', 'email']
    }));

    // Handle the callback
    app.get('/api/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    // Get all users
    app.get('/users', (req, res) => {
        User.find({},
            (error, users) => {
                return res.status(200).json({
                    success: true,
                    users
                })
            })
    })

    // Remove all users
    app.delete('/users', (req, res) => {
        User.remove({},
            (error, users) => {
                return res.status(200).json({
                    success: true,
                    users
                })
            })
    })
};