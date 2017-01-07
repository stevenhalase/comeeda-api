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

const uristring =
    process.env.MONGODB_URI ||
    'mongodb://localhost/comeeda';

let onlineVolunteers = [];

io.on('connection', function(socket){
    socket.emit('connected', 'hello');

    socket.on('volunteerOnline', function(user) {
        user.socketId = socket.id;
        onlineVolunteers.push(user);
        console.log(onlineVolunteers);
    })

    socket.on('volunteerOffline', function() {
        for (let i = 0; i < onlineVolunteers.length; i++) {
            if (onlineVolunteers[i].socketId == socket.id) {
                onlineVolunteers.splice(i,1);
            }
        }
        console.log(onlineVolunteers);
    });

    socket.on('requestPickup', function(user) {
        let userLocation = user.location;
        let smallestDistance;
        let closestVolunteer;
        for (let i = 0; i < onlineVolunteers.length; i++) {
            console.log(userLocation.latitude, userLocation.longitude, 
                    onlineVolunteers[i].location.latitude, onlineVolunteers[i].location.longitude)
            if (i == 0) {
                let distance = calculateDistance(userLocation.latitude, userLocation.longitude, 
                    onlineVolunteers[i].latitude, onlineVolunteers[i].longitude, "M");
                console.log('distance', distance);
                smallestDistance = distance;
                closestVolunteer = onlineVolunteers[i];
            }
            let distance = calculateDistance(userLocation.latitude, userLocation.longitude, 
                onlineVolunteers[i].latitude, onlineVolunteers[i].longitude, "M");
            console.log('distance', distance);
            if (distance < smallestDistance) {
                smallestDistance = distance;
                closestVolunteer = onlineVolunteers[i];
            }
        }
        console.log('Smallest', smallestDistance);
        console.log('Closest', closestVolunteer);
        socket.emit('volunteerAssigned', closestVolunteer);
    })

    socket.on('disconnect', function() {
        for (let i = 0; i < onlineVolunteers.length; i++) {
            if (onlineVolunteers[i].socketId == socket.id) {
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

mongoose.connect(uristring, function(error) {
  if (error) {
      console.error(error);
  } else {
      console.log('Mongoose connected successfully')
  }
})

app.use('/', UserRoutes);

server.listen(port, function () {
    console.log('Server started at localhost:' + port);
})