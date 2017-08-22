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
          closestvolunteers: req.body.closestvolunteers,
          deniedvolunteers: req.body.deniedvolunteers,
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
            Pickup.closestvolunteers = req.body.closestvolunteers ? req.body.closestvolunteers : Pickup.closestvolunteers;
            Pickup.deniedvolunteers = req.body.deniedvolunteers ? req.body.deniedvolunteers : Pickup.deniedvolunteers;
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
    },

    /**
     * PickupController.pickupsByUser()
     */
    pickupsByUser: function (req, res) {
        var userId = req.params.id;
        PickupModel.find({ 'volunteer._id': userId }, function (err, Pickups) {
            if (err) {
                console.log(err)
                return res.status(500).json({
                    message: 'Error when getting Pickup.',
                    error: err
                });
            }
            console.log(Pickups)
            return res.json(Pickups);
        });
    },

    /**
     * PickupController.numberOfPickupsByUser()
     */
    numberOfPickupsByUser: function (req, res) {
        var query = req.query;
        var userId = req.params.id;
        PickupModel.find({ 'volunteer._id': userId }, function (err, Pickups) {
            if (err) {
                console.log(err)
                return res.status(500).json({
                    message: 'Error when getting Pickup.',
                    error: err
                });
            }

            if (query.frame) {
              Pickups = frameFilter(query.frame, Pickups);
            }

            let count = pickupCount(Pickups);

            console.log(count);
            return res.json({result: count});
        });
    },

    /**
     * PickupController.totalDistanceOfPickupsByUser()
     */
    totalDistanceOfPickupsByUser: function (req, res) {
        var query = req.query;
        var userId = req.params.id;
        PickupModel.find({ 'volunteer._id': userId }, function (err, Pickups) {
            if (err) {
                console.log(err)
                return res.status(500).json({
                    message: 'Error when getting Pickup.',
                    error: err
                });
            }

            if (query.frame) {
              Pickups = frameFilter(query.frame, Pickups);
            }

            let totalDistance = totalDistance(Pickups);

            console.log(totalDistance)
            return res.json({result: totalDistance});
        });
    },

    /**
     * PickupController.totalTimeOfPickupsByUser()
     */
    totalTimeOfPickupsByUser: function (req, res) {
        var query = req.query;
        var userId = req.params.id;
        PickupModel.find({ 'volunteer._id': userId }, function (err, Pickups) {
            if (err) {
                console.log(err)
                return res.status(500).json({
                    message: 'Error when getting Pickup.',
                    error: err
                });
            }

            if (query.frame) {
              Pickups = frameFilter(query.frame, Pickups);
            }

            let totalTime = totalTime(Pickups);

            console.log(totalTime)
            return res.json({result: totalTime});
        });
    },

    /**
     * PickupController.userStats()
     */
    userStats: function (req, res) {
        var query = req.query;
        var userId = req.params.id;
        PickupModel.find({ 'volunteer._id': userId }, function (err, Pickups) {
            if (err) {
                console.log(err)
                return res.status(500).json({
                    message: 'Error when getting Pickup.',
                    error: err
                });
            }

            if (query.frame) {
              Pickups = frameFilter(query.frame, Pickups);
            }

            let count = getPickupCount(Pickups);
            let totalDistance = getTotalDistance(Pickups);
            let totalTime = getTotalTime(Pickups);

            console.log(totalTime)
            return res.json({result: {
              count: count,
              totalDistance: totalDistance,
              totalTime: totalTime
            }});
        });
    }
};

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
	return dist
}

function frameFilter(frame, pickupArr) {
  let today = new Date();
  if (frame === 'Week') {
    let lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    pickupArr = pickupArr.filter((pickup) => {
      // console.log(pickup.date > lastWeek)
      return pickup.date > lastWeek;
    })
  } else if (frame === 'Month') {
    let lastWeek = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    pickupArr = pickupArr.filter((pickup) => {
      // console.log(pickup.date > lastWeek)
      return pickup.date > lastWeek;
    })
  } else if (frame === 'Year') {
    let lastWeek = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
    pickupArr = pickupArr.filter((pickup) => {
      // console.log(pickup.date > lastWeek)
      return pickup.date > lastWeek;
    })
  }
  return pickupArr;
}

function getPickupCount(pickups) {
  let counter = 0;
  for (let pickup of pickups) {
    if (pickup.status) {
      if (pickup.status) {
        for (let status of pickup.status) {
          if (status.name === 'Complete') {
            counter++;
          }
        }
      }
    }
  }
  return counter;
}

function getTotalDistance(pickups) {
  let totalDistance = 0;
  for (let pickup of pickups) {
    if (pickup.geo) {
      if (pickup.geo.waypoints) {

        if (pickup.geo.waypoints.length > 1) {
          for (let i = 1; i < pickup.geo.waypoints.length; i++) {
            totalDistance += calculateDistance(pickup.geo.waypoints[i].lat, pickup.geo.waypoints[i].lng, pickup.geo.waypoints[i - 1].lat, pickup.geo.waypoints[i - 1].lng, "M");
          }
        }
      }
    }
  }
  return totalDistance;
}

function getTotalTime(pickups) {
  let totalTime = 0;
  for (let pickup of pickups) {
    if (pickup.status) {
      if (pickup.status) {
        let hasAcceptedStatus = false;
        let hasCanceledStatus = false;
        let hasCompleteStatus = false;
        let startDate = null;
        let endDate = null;
        for (let status of pickup.status) {
          if (status.name === 'Accepted') {
            hasAcceptedStatus = true;
            startDate = status.date;
          } else if (status.name === 'Canceled') {
            hasCanceledStatus = true;
            endDate = status.date;
          } else if (status.name === 'Complete') {
            hasCompleteStatus = true;
            endDate = status.date;
          }
        }
        if (startDate && endDate) {
          totalTime += Math.abs(endDate - startDate) / 36e5;
        }
      }
    }
  }
  return totalTime;
}