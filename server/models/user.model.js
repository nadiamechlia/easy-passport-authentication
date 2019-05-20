const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

let userSchema = new Schema({
	local: {
		name: String,
		email: String,
		password: String
	},
	facebook: {
		id: String,
		token: String,
		name: String,
		email: String
	},
	google: {
		id: String,
		token: String,
		name: String,
		email: String
	}
});

// Generating password hash
userSchema.methods.generateHash = (password) => {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

// Check if valid password
userSchema.methods.validPassword = (password, localPass) => {
	// return bcrypt.compareSync(password, this.local.password);
	return bcrypt.compareSync(password, localPass);
}

// Export user model
module.exports = mongoose.model('User', userSchema);
