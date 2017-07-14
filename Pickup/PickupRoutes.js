var express = require('express');
var router = express.Router();
var PickupController = require('./PickupController.js');

/*
 * GET
 */
router.get('/', PickupController.list);

/*
 * GET
 */
router.get('/:id', PickupController.show);

/*
 * POST
 */
router.post('/', PickupController.create);

/*
 * PUT
 */
router.put('/:id', PickupController.update);

/*
 * DELETE
 */
router.delete('/:id', PickupController.remove);

/*
 * GET
 */
router.get('/api/pickups/user/:id', PickupController.pickupsByUser);

module.exports = router;
