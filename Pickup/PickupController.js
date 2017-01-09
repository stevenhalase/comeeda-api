var PickupModel = require('./PickupModel.js').PickupModel;

/**
 * PickupController.js
 *
 * @description :: Server-side logic for managing Pickups.
 */
module.exports = {

    /**
     * PickupController.list()
     */
    list: function (req, res) {
        PickupModel.find(function (err, Pickups) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Pickup.',
                    error: err
                });
            }
            return res.json(Pickups);
        });
    },

    /**
     * PickupController.show()
     */
    show: function (req, res) {
        var id = req.params.id;
        PickupModel.findOne({_id: id}, function (err, Pickup) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Pickup.',
                    error: err
                });
            }
            if (!Pickup) {
                return res.status(404).json({
                    message: 'No such Pickup'
                });
            }
            return res.json(Pickup);
        });
    },

    /**
     * PickupController.create()
     */
    create: function (req, res) {
        var Pickup = new PickupModel({
			donator : req.body.donator,
			volunteer : req.body.volunteer,
			status : req.body.status,
			date : req.body.date,
			geo : req.body.geo
        });

        Pickup.save(function (err, Pickup) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating Pickup',
                    error: err
                });
            }
            return res.status(201).json(Pickup);
        });
    },

    /**
     * PickupController.update()
     */
    update: function (req, res) {
        var id = req.params.id;
        PickupModel.findOne({_id: id}, function (err, Pickup) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Pickup',
                    error: err
                });
            }
            if (!Pickup) {
                return res.status(404).json({
                    message: 'No such Pickup'
                });
            }

            Pickup.donator = req.body.donator ? req.body.donator : Pickup.donator;
			Pickup.volunteer = req.body.volunteer ? req.body.volunteer : Pickup.volunteer;
			Pickup.status = req.body.status ? req.body.status : Pickup.status;
			Pickup.date = req.body.date ? req.body.date : Pickup.date;
			Pickup.geo = req.body.geo ? req.body.geo : Pickup.geo;
			
            Pickup.save(function (err, Pickup) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating Pickup.',
                        error: err
                    });
                }

                return res.json(Pickup);
            });
        });
    },

    /**
     * PickupController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;
        PickupModel.findByIdAndRemove(id, function (err, Pickup) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the Pickup.',
                    error: err
                });
            }
            return res.status(204).json();
        });
    }
};
