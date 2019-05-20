const User = require('../server/models/user.model');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// Load the auth variables
const configAuth = require('./auth');

module.exports = (passport) => {
    // Serialize the user for the session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    })

    // Deserialize the user
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        })
    })

    // *************** LOCAL LOGIN *************** //
    passport.use(
        'local-login',
        new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        }, (req, email, password, done) => {
            if (email) email = email.toLowerCase();

            process.nextTick(() => {
                User.findOne({
                    'local.email': email
                }, (err, user) => {
                    console.log('useruser', user)
                    if (err) return done(err);

                    if (!user) return done(null, false, req.flash('loginMessage', 'No user found.'));

                    if (!user.validPassword(password, user.local.password))
                        return done(null, false, req.flash('loginMessage', 'Wrong password or mail.'));
                    else
                        return done(null, user);
                })
            })
        })
    );

    // *************** LOCAL SIGNUP *************** //
    // Override local strategy uses username and password
    passport.use(
        'local-signup',
        new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        }, (req, email, password, done) => {
            if (email) email = email.toLowerCase();

            process.nextTick(() => {
                if (!req.user) {
                    User.findOne({
                        'local.email': email
                    }, (err, user) => {
                        if (err) return done(err);

                        if (user) {
                            return done(null, false, req.flash('loginMessage', 'That email is already taken.'));
                        } else {
                            var newUser = new User();

                            newUser.local.email = email;
                            newUser.local.password = newUser.generateHash(password);
                            newUser.local.name = req.body.name;

                            newUser.save(function (err) {
                                if (err) return done(err);

                                return done(null, newUser);
                            });
                        }
                    });
                    // if the user is logged in but has no local account
                } else if (!req.user.local.email) {
                    User.findOne({
                        'local.email': email
                    }, (err, user) => {
                        if (err) return done(err);

                        if (user) {
                            return done(null, false, req.flash('loginMessage', 'That email is already taken.'));
                        } else {
                            var user = req.user;
                            user.local.email = email;
                            user.local.password = user.generateHash(password);
                            user.local.name = req.body.name;

                            user.save((err) => {
                                if (err) return done(err);

                                return done(null, user);
                            });
                        }
                    });
                } else {
                    return done(null, req.user);
                }
            });
        })
    );

    // *************** FACEBOOK *************** //
    var fbStrategy = configAuth.facebookAuth;
    fbStrategy.passReqToCallback = true;
    passport.use(
        new FacebookStrategy(fbStrategy, function (req, token, refreshToken, profile, done) {
            process.nextTick(function () {
                // check if the user is already logged in
                if (!req.user) {
                    User.findOne({
                        'facebook.id': profile.id
                    }, function (err, user) {
                        if (err) return done(err);

                        if (user) {
                            // if there is a user id already but no token
                            if (!user.facebook.token) {
                                user.facebook.token = token;
                                user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                                user.facebook.email = (profile.emails[0].value || '').toLowerCase();

                                user.save(function (err) {
                                    if (err) return done(err);

                                    return done(null, user);
                                });
                            }

                            return done(null, user);
                        } else {
                            var newUser = new User();

                            newUser.facebook.id = profile.id;
                            newUser.facebook.token = token;
                            newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                            newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();

                            newUser.save(function (err) {
                                if (err) return done(err);

                                return done(null, newUser);
                            });
                        }
                    });
                } else {
                    var user = req.user;

                    user.facebook.id = profile.id;
                    user.facebook.token = token;
                    user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                    user.facebook.email = (profile.emails[0].value || '').toLowerCase();

                    user.save(function (err) {
                        if (err) return done(err);

                        return done(null, user);
                    });
                }
            });
        })
    );

    // *************** GOOGLE *************** //
    passport.use(
        new GoogleStrategy({
                clientID: configAuth.googleAuth.clientID,
                clientSecret: configAuth.googleAuth.clientSecret,
                callbackURL: configAuth.googleAuth.callbackURL,
                passReqToCallback: true
            },
            function (req, token, refreshToken, profile, done) {
                // asynchronous
                process.nextTick(function () {
                    if (!req.user) {
                        User.findOne({
                            'google.id': profile.id
                        }, function (err, user) {
                            if (err) return done(err);

                            if (user) {
                                if (!user.google.token) {
                                    user.google.token = token;
                                    user.google.name = profile.displayName;
                                    user.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email

                                    user.save(function (err) {
                                        if (err) return done(err);

                                        return done(null, user);
                                    });
                                }

                                return done(null, user);
                            } else {
                                var newUser = new User();

                                newUser.google.id = profile.id;
                                newUser.google.token = token;
                                newUser.google.name = profile.displayName;
                                newUser.google.email = (profile.emails[0].value || '').toLowerCase();

                                newUser.save(function (err) {
                                    if (err) return done(err);

                                    return done(null, newUser);
                                });
                            }
                        });
                    } else {
                        var user = req.user;

                        user.google.id = profile.id;
                        user.google.token = token;
                        user.google.name = profile.displayName;
                        user.google.email = (profile.emails[0].value || '').toLowerCase();

                        user.save(function (err) {
                            if (err) return done(err);

                            return done(null, user);
                        });
                    }
                });
            }
        )
    );

}