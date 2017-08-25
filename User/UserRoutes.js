var express = require('express');
var router = express.Router();
var UserController = require('./UserController.js');

/*
 * GET
 */
router.get('/api/users/', UserController.list);

/*
 * GET
 */
router.get('/api/users/:id', UserController.show);

/*
 * GET
 */
router.post('/api/users/login', UserController.login);

/*
 * POST
 */
router.post('/api/users/', UserController.create);

// /*
//  * POST
//  */
// router.post('/api/users/profilepicture/:id', UserController.uploadProfilePicture);

/*
 * PUT
 */
router.put('/api/users/:id', UserController.update);

/*
 * DELETE
 */
router.delete('/api/users/:id', UserController.remove);

module.exports = router;
