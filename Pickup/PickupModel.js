var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var UserSchema = require('../User/UserModel').UserSchema;

var PickupSchema = new Schema({
	'donator' : UserSchema,
  'volunteer' : UserSchema,
  'closestvolunteers': [ UserSchema ],
  'deniedvolunteers': [ UserSchema ],
	'status' : [{ name: String, date: Date }],
	'date' : Date,
	'geo': Object
});

module.exports = {
	PickupModel : mongoose.model('Pickup', PickupSchema),
	PickupSchema : PickupSchema
}
