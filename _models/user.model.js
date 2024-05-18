const mongoose = require('mongoose');

const schema = mongoose.Schema;
const user = new schema({
    name: { type: String, required: false },
    email: { type: String, unique: true, required: false },
    password: { type: String },
    profilePhoto: { type: String },
    gender: { type: String, enum: ["male", "female"], default: "male" },
    deviceToken: { type: String },
    isOnline: { type: Boolean },
    lastSeen: { type: String },
    socketId: { type: String, unique: true },
}, {
    versionKey: false,
    timestamps: true,
});

module.exports = mongoose.model('user', user);