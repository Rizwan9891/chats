const mongoose = require('mongoose');
const schema = mongoose.Schema;
const chat = new schema({
    senderId: { type: mongoose.Types.ObjectId, required: true },
    receiverId: { type: mongoose.Types.ObjectId, required: true },
    message: { type: String },
}, { versionKey: false, timestamps: true, });
module.exports = mongoose.model('chat', chat);