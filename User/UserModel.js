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
	'image': { type: Schema.Mixed, ref: 'fs.files' },
	'location': Object,
	'socketid': String,
  'modifiedon': Date
});

module.exports = {
	UserModel : mongoose.model('User', UserSchema),
	UserSchema : UserSchema
}
