module.exports = {
    'facebookAuth': {
        'clientID': process.env.FACEBOOK_CLIENT_ID, // your App ID
        'clientSecret': process.env.FACEBOOK_CLIENT_SECRET, // your App Secret
        'callbackURL': process.env.FACEBOOK_CALLBACK_URL,
        'profileURL': process.env.FACEBOOK_PROFILE_URL,
        'profileFields': ['id', 'email', 'name'] // For requesting permissions from Facebook API

    },

    'googleAuth': {
        'clientID': process.env.GOOGLE_CLIENT_ID,
        'clientSecret': process.env.GOOGLE_CLIENT_SECRET,
        'callbackURL': process.env.GOOGLE_CALLBACK_URL
    }
};