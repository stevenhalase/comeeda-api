var express = require('express');
var router = express.Router();
var PickupController = require('./PickupController.js');

/*
 * GET
 */
router.get('/api/pickups/', PickupController.list);

/*
 * GET
 */
router.get('/api/pickups/:id', PickupController.show);

/*
 * POST
 */
router.post('/api/pickups/', PickupController.create);

/*
 * PUT
 */
router.put('/api/pickups/:id', PickupController.update);

/*
 * DELETE
 */
router.delete('/api/pickups/:id', PickupController.remove);

/*
 * GET
 */
router.get('/api/pickups/user/:id', PickupController.pickupsByUser);

/*
 * GET
 */
router.get('/api/pickups/user/number/:id', PickupController.numberOfPickupsByUser);

/*
 * GET
 */
router.get('/api/pickups/user/distance/:id', PickupController.totalDistanceOfPickupsByUser);

/*
 * GET
 */
router.get('/api/pickups/user/time/:id', PickupController.totalTimeOfPickupsByUser);

/*
 * GET
 */
router.get('/api/pickups/user/stats/:id', PickupController.userStats);

/*
 * GET
 */
router.get('/api/pickups/staticmap/:id', PickupController.staticMap);

module.exports = router;
