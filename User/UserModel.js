var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var UserSchema = new Schema({
	'firstname' : String,
	'lastname' : String,
	'email' : String,
	'organization' : String,
	'jobtitle': String,
	'city': String,
	'state': String,
	'membertype' : Array,
	'password' : String,
	'image': { data: Buffer, contentType: String },
	'location': Object,
	'socketid': String
});

module.exports = {
	UserModel : mongoose.model('User', UserSchema),
	UserSchema : UserSchema
}
