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


io.on('connection', function(socket){
    io.emit('connected', 'hello');
});

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