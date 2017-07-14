var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var UserSchema = require('../User/UserModel').UserSchema;

var PickupSchema = new Schema({
	'donator' : UserSchema,
	'volunteer' : UserSchema,
	'status' : [{ name: String, date: Date }],
	'date' : Date,
	'geo': Object,
  'startdate': Date,
  'enddate': Date
});

module.exports = {
	PickupModel : mongoose.model('Pickup', PickupSchema),
	PickupSchema : PickupSchema
}
