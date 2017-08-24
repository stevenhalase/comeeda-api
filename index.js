const express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
const mongoose = require('mongoose');
const request = require('request');
const logger = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const port = process.env.PORT || 4000;

const UserRoutes = require('./User/UserRoutes');
const PickupRoutes = require('./Pickup/PickupRoutes');

const User = require('./User/UserModel').UserModel;
const Pickup = require('./Pickup/PickupModel').PickupModel;

const uristring =
    process.env.MONGODB_URI ||
    'mongodb://localhost/comeeda';

let onlineVolunteers = [];
let tempPickups = [];
let activePickups = [];

io.on('connection', (socket) => {
    socket.emit('connected', 'hello');

    socket.on('volunteerOnline', (user) => {
        user.socketid = socket.id;
        onlineVolunteers.push(user);
        console.log(onlineVolunteers);
    })

    socket.on('volunteerOffline', () => {
        for (let i = 0; i < onlineVolunteers.length; i++) {
            if (onlineVolunteers[i].socketid == socket.id) {
                onlineVolunteers.splice(i,1);
            }
        }
        console.log(onlineVolunteers);
    });

    socket.on('findVolunteers', (user) => {
      let nearbyVolunteers = [];
      for (let i = 0; i < onlineVolunteers.length; i++) {
          console.log(user.location.latitude, user.location.longitude, 
                  onlineVolunteers[i].location.latitude, onlineVolunteers[i].location.longitude)
          let distance = calculateDistance(user.location.latitude, user.location.longitude, 
                  onlineVolunteers[i].location.latitude, onlineVolunteers[i].location.longitude, "M");

          if (distance <= 10) {
            nearbyVolunteers.push(onlineVolunteers[i]);
          }
      }
      user.socketid = socket.id;
      io.to(user.socketid).emit('foundVolunteers', nearbyVolunteers);
    })

    socket.on('requestPickup', (user) => {
        let distanceSortedVolunteers = onlineVolunteers.slice().sort((a, b) => {
          let volADistance = calculateDistance(user.location.latitude, user.location.longitude, 
                    a.location.latitude, a.location.longitude, "M");
          let volBDistance = calculateDistance(user.location.latitude, user.location.longitude, 
                    b.location.latitude, b.location.longitude, "M");
          console.log('Sorting Distance Compare: ', volADistance - volBDistance)
          return volADistance - volBDistance;
        })
        console.log('Sorted: ', distanceSortedVolunteers);
        user.socketid = socket.id;
        new Pickup({
            donator: user,
            volunteer: {},
            closestvolunteers: distanceSortedVolunteers,
            deniedvolunteers: [],
            status: [{ name: 'New', date: Date.now() }],
            date: Date.now()
        }).save((err, tempPickup) => {
          console.log('TEMP: ', tempPickup)
          tempPickups.push(tempPickup);
          io.to(tempPickup.closestvolunteers[0].socketid).emit('tryAssignment', tempPickup);
        });
        
    })

    socket.on('acceptPickupRequest', (tempPickup) => {
        console.log('Accepting pickup: ', tempPickup)
        tempPickup.status.push({ name: 'Accepted', date: Date.now() })
        tempPickup.volunteer = tempPickup.closestvolunteers[0];
        io.to(tempPickup.donator.socketid).emit('volunteerAssigned', tempPickup.volunteer);
        io.to(tempPickup.closestvolunteers[0].socketid).emit('startPickup', tempPickup);
        for (var i = 0; i < tempPickups.length; i++) {
            if (tempPickup._id == tempPickups[i]._id) {
                activePickups.push(tempPickup);
                tempPickups.splice(i, 1);
                Pickup.findByIdAndUpdate(tempPickup._id, {
                    donator: tempPickup.donator,
                    volunteer: tempPickup.volunteer,
                    closestvolunteers: tempPickup.closestvolunteers,
                    deniedvolunteers: tempPickup.deniedvolunteers,
                    geo: tempPickup.geo,
                    date: tempPickup.date,
                    status: tempPickup.status
                }, { upsert: true }, (err,res) => {
                  if (err) { console.log(err)};
                  console.log(res);
                });
            }
        }
    });

    socket.on('denyPickupRequest', (tempPickup) => {
        console.log('Denying pickup: ', tempPickup)
        io.to(tempPickup.closestvolunteers[0].socketid).emit('pickupCanceledVolunteer');
        tempPickup.deniedvolunteers.push(tempPickup.closestvolunteers.splice(0,1));
        if (tempPickup.closestvolunteers.length > 0) {
          io.to(tempPickup.closestvolunteers[0].socketid).emit('tryAssignment', tempPickup);
        } else {
          console.log('Canceling pickup: ', tempPickup)
          tempPickup.status.push({ name: 'Canceled', date: Date.now() })
          io.to(tempPickup.donator.socketid).emit('pickupCanceledDonator');
          for (var i = 0; i < tempPickups.length; i++) {
              if (tempPickup._id == tempPickups[i]._id) {
                  tempPickups.splice(i, 1);
                  Pickup.findByIdAndUpdate(tempPickup._id, {
                      donator: tempPickup.donator,
                      volunteer: tempPickup.volunteer,
                      closestvolunteers: tempPickup.closestvolunteers,
                      deniedvolunteers: tempPickup.deniedvolunteers,
                      geo: tempPickup.geo,
                      date: tempPickup.date,
                      status: tempPickup.status
                  }, { upsert: true }, (err,res) => {
                    if (err) { console.log(err)};
                    console.log(res);
                  });
              }
          }
        }
    });

    socket.on('cancelPickup', (activePickup) => {
        console.log('Canceling pickup: ', activePickup)
        activePickup.status.push({ name: 'Canceled', date: Date.now() })
        io.to(activePickup.donator.socketid).emit('pickupCanceledDonator');
        io.to(activePickup.volunteer.socketid).emit('pickupCanceledVolunteer');
        for (var i = 0; i < activePickups.length; i++) {
            if (activePickup._id == activePickups[i]._id) {
                activePickups.splice(i, 1);
                Pickup.findByIdAndUpdate(activePickup._id, {
                    donator: activePickup.donator,
                    volunteer: activePickup.volunteer,
                    geo: activePickup.geo,
                    date: activePickup.date,
                    status: activePickup.status
                }, { upsert: true }, (err,res) => {
                  if (err) { console.log(err)};
                  console.log(res);
                });
            }
        }
    });

    socket.on('completePickup', (activePickup) => {
        console.log('Completing pickup: ', activePickup)
        activePickup.status.push({ name: 'Complete', date: Date.now() })
        io.to(activePickup.donator.socketid).emit('pickupCompleteDonator');
        io.to(activePickup.volunteer.socketid).emit('pickupCompleteVolunteer');
        for (var i = 0; i < activePickups.length; i++) {
            if (activePickup._id == activePickups[i]._id) {
                activePickups.splice(i, 1);
                Pickup.findByIdAndUpdate(activePickup._id, {
                    donator: activePickup.donator,
                    volunteer: activePickup.volunteer,
                    closestvolunteers: activePickup.closestvolunteers,
                    deniedvolunteers: activePickup.deniedvolunteers,
                    geo: activePickup.geo,
                    date: activePickup.date,
                    status: activePickup.status,
                    startdate: activePickup.startdate,
                    enddate: Date.now()
                }, { upsert: true }, (err,res) => {
                  if (err) { console.log(err)};
                  console.log(res);
                });
            }
        }
    });

    socket.on('updateVolunteerLocation', (volLatLng, activePickup) => {
        for (let i = 0; i < onlineVolunteers.length; i++) {
            if (onlineVolunteers[i].socketid == socket.id) {
                onlineVolunteers[i].location.latitude = volLatLng.lat;
                onlineVolunteers[i].location.longitude = volLatLng.lng;
            }
        }
        io.to(activePickup.donator.socketid).emit('updateVolunteerLocationForDonator', volLatLng);
    })

    socket.on('disconnect', () => {
        for (let i = 0; i < onlineVolunteers.length; i++) {
            if (onlineVolunteers[i].socketid == socket.id) {
                onlineVolunteers.splice(i,1);
            }
        }
        console.log(onlineVolunteers);
    });
});

function calculateDistance(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var theta = lon1-lon2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	if (unit=="K") { dist = dist * 1.609344 }
	if (unit=="N") { dist = dist * 0.8684 }
    console.log(dist);
	return dist
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", req.header("Origin"));
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});
app.use(express.static(path.join(__dirname, './www')))

mongoose.connect(uristring, (error) => {
  if (error) {
      console.error(error);
  } else {
      console.log('Mongoose connected successfully')
  }
})

app.use('/', UserRoutes);
app.use('/', PickupRoutes);

server.listen(port, () => {
    console.log('Server started at localhost:' + port);
})