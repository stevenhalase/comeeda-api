const UserModel = require('./UserModel.js').UserModel;
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(10);

/**
 * UserController.js
 *
 * @description :: Server-side logic for managing Users.
 */
module.exports = {

    /**
     * UserController.list()
     */
    list: function (req, res) {
        UserModel.find(function (err, Users) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting User.',
                    error: err
                });
            }
            return res.json(Users);
        });
    },

    /**
     * UserController.show()
     */
    show: function (req, res) {
        var id = req.params.id;
        UserModel.findOne({_id: id}, function (err, User) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting User.',
                    error: err
                });
            }
            if (!User) {
                return res.status(404).json({
                    message: 'No such User'
                });
            }
            return res.json(User);
        });
    },

    /**
     * UserController.login()
     */
    login: function (req, res) {
        console.log('LOGIN: ', req.body);
        var email = req.body.email;
        UserModel.findOne({email: email}, function (err, User) {
            if (err) {
                return res.json({
                    message: 'Failure getting User',
                    error: 'Failure getting User'
                });
            }
            if (!User) {
                return res.json({
                    message: 'Failure getting User',
                    error: 'Failure getting User'
                });
            }

            if (User) {
                if(bcrypt.compareSync(req.body.password, User.password)) {
                    return res.json(User);
                } else {
                    return res.json({
                        message: 'Failure getting User',
                        error: 'Failure getting User'
                    });
                }
            }
            
        });
    },

    /**
     * UserController.create()
     */
    create: function (req, res) {
        console.log('CREATE: ', req.body)
        var email = req.body.email;
        UserModel.findOne({email: email}, function (err, User) {
            if (err) {
                return res.status(500).json({
                    message: 'Error creating User.',
                    error: err
                });
            }

            if (User) {
                return res.status(404).json({
                    message: 'User email address already in use'
                });
            }

            if (!User) {
                var User = new UserModel({
                    firstname : req.body.firstname,
                    lastname : req.body.lastname,
                    email : req.body.email,
                    organization : req.body.organization,
                    membertype : req.body.membertype,
                    password : req.body.password,
                    location : req.body.location,
                    socketid : req.body.socketid,
                    modifiedon : new Date(Date.now())
                });
                console.log('PASSWORD: ', User.password);
                User.password = bcrypt.hashSync(User.password, salt);

                User.save(function (err, User) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when creating User',
                            error: err
                        });
                    }
                    return res.status(201).json(User);
                });
            }
        });
    },

    /**
     * UserController.update()
     */
    update: function (req, res) {
        var id = req.params.id;
        UserModel.findOne({_id: id}, function (err, User) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting User',
                    error: err
                });
            }
            if (!User) {
                return res.status(404).json({
                    message: 'No such User'
                });
            }

            User.firstname = req.body.firstname ? req.body.firstname : User.firstname;
            User.lastname = req.body.lastname ? req.body.lastname : User.lastname;
            User.email = req.body.email ? req.body.email : User.email;
            User.organization = req.body.organization ? req.body.organization : User.organization;
            User.jobtitle = req.body.jobtitle ? req.body.jobtitle : User.jobtitle;
            User.city = req.body.city ? req.body.city : User.city;
            User.state = req.body.state ? req.body.state : User.state;
            User.membertype = req.body.membertype ? req.body.membertype : User.membertype;
            User.password = req.body.password ? req.body.password : User.password;
            User.image = req.body.image ? req.body.image : User.image;
            User.location = req.body.location ? req.body.location : User.location;
            User.socketid = req.body.socketid ? req.body.socketid : User.socketid;
            User.modifiedon = new Date(Date.now());
			
            User.save(function (err, User) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating User.',
                        error: err
                    });
                }

                return res.json(User);
            });
        });
    },

    /**
     * UserController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;
        UserModel.findByIdAndRemove(id, function (err, User) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the User.',
                    error: err
                });
            }
            return res.status(204).json();
        });
    }
};
