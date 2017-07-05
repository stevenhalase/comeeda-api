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
        let smallestDistance;
        let closestVolunteer;
        for (let i = 0; i < onlineVolunteers.length; i++) {
            console.log(user.location.latitude, user.location.longitude, 
                    onlineVolunteers[i].location.latitude, onlineVolunteers[i].location.longitude)
            if (i == 0) {
                let distance = calculateDistance(user.location.latitude, user.location.longitude, 
                    onlineVolunteers[i].location.latitude, onlineVolunteers[i].location.longitude, "M");
                console.log('distance', distance);
                smallestDistance = distance;
                closestVolunteer = onlineVolunteers[i];
            }
            let distance = calculateDistance(user.location.latitude, user.location.longitude, 
                onlineVolunteers[i].location.latitude, onlineVolunteers[i].location.longitude, "M");
            console.log('distance', distance);
            if (distance < smallestDistance) {
                smallestDistance = distance;
                closestVolunteer = onlineVolunteers[i];
            }
        }
        console.log('Smallest', smallestDistance);
        console.log('Closest', closestVolunteer);
        user.socketid = socket.id;
        var tempPickup = {
            donator: user,
            volunteer: closestVolunteer,
            status: [{ name: 'New', date: Date.now() }],
            date: Date.now()
        }
        tempPickups.push(tempPickup);
        io.to(closestVolunteer.socketid).emit('tryAssignment', tempPickup);
    })

    socket.on('acceptPickupRequest', (tempPickup) => {
        console.log('Accepting pickup: ', tempPickup)
        tempPickup.status.push({ name: 'Accepted', date: Date.now() })
        io.to(tempPickup.donator.socketid).emit('volunteerAssigned', tempPickup.volunteer);
        io.to(tempPickup.volunteer.socketid).emit('startPickup', tempPickup);
        for (var i = 0; i < tempPickups.length; i++) {
            if (tempPickup.id == tempPickups[i].id) {
                activePickups.push(tempPickup);
                tempPickups.splice(i, 1);
                tempPickup = new Pickup({
                    donator: tempPickup.donator,
                    volunteer: tempPickup.volunteer,
                    geo: tempPickup.geo,
                    date: tempPickup.date,
                    status: tempPickup.status
                }).save();
            }
        }
    });

    socket.on('cancelPickup', (activePickup) => {
        console.log('Canceling pickup: ', activePickup)
        activePickup.status.push({ name: 'Canceled', date: Date.now() })
        io.to(activePickup.donator.socketid).emit('pickupCanceledDonator');
        io.to(activePickup.volunteer.socketid).emit('pickupCanceledVolunteer');
        for (var i = 0; i < activePickups.length; i++) {
            if (activePickup.id == activePickups[i].id) {
                activePickups.splice(i, 1);
                activePickup = new Pickup({
                    donator: activePickup.donator,
                    volunteer: activePickup.volunteer,
                    geo: activePickup.geo,
                    date: activePickup.date,
                    status: activePickup.status
                }).save();
            }
        }
    });

    socket.on('completePickup', (activePickup) => {
        console.log('Completing pickup: ', activePickup)
        activePickup.status.push({ name: 'Complete', date: Date.now() })
        io.to(activePickup.donator.socketid).emit('pickupCompleteDonator');
        io.to(activePickup.volunteer.socketid).emit('pickupCompleteVolunteer');
        for (var i = 0; i < activePickups.length; i++) {
            if (activePickup.id == activePickups[i].id) {
                activePickups.splice(i, 1);
                activePickup = new Pickup({
                    donator: activePickup.donator,
                    volunteer: activePickup.volunteer,
                    geo: activePickup.geo,
                    date: activePickup.date,
                    status: activePickup.status
                }).save();
            }
        }
    });

    socket.on('updateVolunteerLocation', (volLatLng, activePickup) => {
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

server.listen(port, () => {
    console.log('Server started at localhost:' + port);
})