var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var FileSchema = new Schema({}, { strict: false, collection: 'fs.files' });
var File = mongoose.model('File', FileSchema);

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
	'image': { type: Schema.Types.ObjectId, ref: 'File' },
	'location': Object,
	'socketid': String,
  'modifiedon': Date
});

module.exports = {
	UserModel : mongoose.model('User', UserSchema),
	UserSchema : UserSchema
}
