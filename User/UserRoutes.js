var express = require('express');
var router = express.Router();
var UserController = require('./UserController.js');

const mongoose = require('mongoose');
var multiparty = require('connect-multiparty')();
var fs = require('fs');
var Gridfs = require('gridfs-stream');
const UserModel = require('./UserModel.js').UserModel;

/*
 * GET
 */
router.get('/api/users/', UserController.list);

/*
 * GET
 */
router.get('/api/users/rankings/pickups', UserController.rankingsPickups);

/*
 * GET
 */
router.get('/api/users/rankings/distance', UserController.rankingsDistanceOnPickups);

/*
 * GET
 */
router.get('/api/users/rankings/time', UserController.rankingsTimeOnPickups);

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

/*
 * PUT
 */
router.put('/api/users/:id', UserController.update);

/*
 * DELETE
 */
router.delete('/api/users/:id', UserController.remove);

router.post('/api/users/profilepicture/:id', multiparty, function(req, res){
   var db = mongoose.connection.db;
   var mongoDriver = mongoose.mongo;
   var gfs = new Gridfs(db, mongoDriver);
   var writestream = gfs.createWriteStream({
     filename: req.files.file.name,
     mode: 'w',
     content_type: req.files.file.mimetype,
     metadata: req.body
   });
   fs.createReadStream(req.files.file.path).pipe(writestream);
   writestream.on('close', function(file) {
      console.log('FILE: ', file);
      console.log('FILEID: ', file._id);
      UserModel.findById(req.params.id, function(err, user) {
        if (err) { console.log('ERR: ', err) }
        user.image = file._id;
        user.save(function(err, updatedUser) {
          if (err) { console.log('ERR: ', err) }
          console.log('UPDATE: ', updatedUser)
          return res.json(200, updatedUser)
        })
      });
      fs.unlink(req.files.file.path, function(err) {
        if (err) { console.log('ERR: ', err) }
        console.log('success!')
      });
   });
});

router.get('/api/users/profilepicture/:id', function(req, res) {
   var db = mongoose.connection.db;
   var mongoDriver = mongoose.mongo;
   var gfs = new Gridfs(db, mongoDriver);
   var readstream = gfs.createReadStream({
      _id: req.params.id
   });
   readstream.pipe(res);
  //  return res;
});

module.exports = router;
