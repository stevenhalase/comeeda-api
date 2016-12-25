var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var UserSchema = new Schema({
	'firstname' : String,
	'lastname' : String,
	'email' : String,
	'organization' : String,
	'membertype' : Array,
	'password' : String
});

module.exports = mongoose.model('User', UserSchema);
