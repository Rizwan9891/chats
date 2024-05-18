const user = require('../_models/user.model');
const formidable = require('formidable');
const ObjectID = require('mongodb').ObjectId;
const bcryptjs = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const awsHelper = require('../_helpers/aws.helper');
exports.signup = (req, res) => {
    user.findOne({ email: req.body.email }).then((userFound) => {
        if (userFound == null) {
            bcryptjs.hash(req.body.password, 10).then((hashed) => {
                let ins = new user({
                    email: req.body.email,
                    password: hashed,
                });
                ins.save().then((created) => {
                    let token = jsonwebtoken.sign({ user: created }, 'privateKey');
                    res.status(200).json({ err: false, msg: " Signed in successfully.", token: token });
                }).catch((err) => {
                    res.status(500).json({ err: true, msg: err });
                });
            }).catch((err) => {
                res.status(500).json({ err: true, msg: err });
            })
        } else {
            res.status(500).json({ err: true, msg: "Email  Already Exists." });
        }
    }).catch((err) => {
        res.status(500).json({ err: true, msg: err });
    })
}
exports.login = (req, res) => {
    user.findOne({ email: req.body.email }).then((userFound) => {
        if (userFound !== null) {
            bcryptjs.compare(req.body.password, userFound.password).then((compared) => {
                if (compared) {
                    let token = jsonwebtoken.sign({ user: userFound }, 'privateKey');
                    res.status(200).json({ err: false, msg: "Signin successfully.", token: token });
                } else {
                    res.status(401).json({ err: true, msg: "Incorrect password." });
                }
            }).catch((err) => {
                console.log(err);
                res.status(500).json({ err: true, msg: err });
            });
        } else {
            res.status(500).json({ err: true, msg: "User Not Found." });
        }
    }).catch((err) => {
        console.log(err);
        res.status(500).json({ err: true, msg: err });
    });
}
exports.updateProfile = (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        user.findOne({ _id: ObjectID(fields.userId) }).then((userFound) => {
            if (userFound == null) {
                res.status(404).json({ err: true, msg: "Account are not exist." });
            } else {
                const body = {
                    name: fields.name,
                    gender: fields.gender,
                    profilePhoto: '',
                };
                if (files.profilePhoto === undefined) {
                    delete body.profilePhoto;
                    user.updateOne({ _id: ObjectID(fields.userId) }, { $set: body }).then((updateUser) => {
                        if (updateUser.modifiedCount !== 1) {
                            res.status(400).json({ err: true, msg: "User not updated." });
                        } else {
                            user.findOne({ _id: ObjectID(fields.userId) }).then((userFound) => {
                                res.status(200).json({ err: false, msg: "Successfully updated.", user: userFound });
                            }).catch((err) => {
                                res.status(500).json({ err: true, msg: err });
                            });
                        }
                    }).catch((err) => {
                        res.status(500).json({ err: true, msg: err });
                    });
                } else {
                    awsHelper.uploadToS3(files).then((uploaded) => {
                        body.profilePhoto = uploaded;
                        user.updateOne({ _id: ObjectID(fields.userId) }, { $set: body }).then((updateUser) => {
                            if (updateUser.modifiedCount !== 1) {
                                res.status(400).json({ err: true, msg: "User not updated." });
                            } else {
                                user.findOne({ _id: ObjectID(fields.userId) }).then((userFound) => {
                                    res.status(200).json({ err: false, msg: "Successfully updated.", user: userFound });
                                }).catch((err) => {
                                    res.status(500).json({ err: true, msg: err });
                                });
                            }
                        }).catch((err) => {
                            console.log(err)
                            res.status(500).json({ err: true, msg: err });
                        });
                    }).catch((err) => {
                        console.log(err)
                        res.status(500).json({ err: true, msg: err });
                    });
                }
            }
        }).catch((err) => {
            res.status(500).json({ err: true, msg: err });
        })
    });
}