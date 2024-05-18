const chat = require('../_models/chat.model');
const user = require('../_models/user.model');
const ObjectID = require('mongodb').ObjectId;
const mongoose = require('mongoose');
exports.getChats = (req, res) => {
    if (req.body.pages >= 1) {
        chat.find({ $or: [{ senderId: ObjectID(req.body.senderId), receiverId: ObjectID(req.body.receiverId) }, { senderId: ObjectID(req.body.receiverId), receiverId: ObjectID(req.body.senderId) }] }).sort({ createdAt: -1 }).limit(20).skip((req.body.pages - 1) * 20).then((chatsFound) => {
            if (chatsFound !== null) {
                user.findOne({ _id: ObjectID(req.body.senderId) }).then((senderFound) => {
                    if (senderFound !== null) {
                        user.findOne({ _id: ObjectID(req.body.receiverId) }).then((receiverFound) => {
                            if (receiverFound !== null) {
                                res.status(200).json({ err: false, msg: "Successfully retrieve", senderProfile: senderFound.profileUrl, receiverProfile: receiverFound.profileUrl, chats: chatsFound });
                            } else {
                                res.status(500).json({ err: true, msg: "Receiver not found." });
                            }
                        }).catch((err) => {
                            res.status(500).json({ err: true, msg: err });
                        })
                    } else {
                        res.status(500).json({ err: true, msg: "Sender not found." });
                    }
                }).catch((err) => {
                    res.status(500).json({ err: true, msg: err });
                })
            } else {
                res.status(500).json({ err: true, msg: "Chats not found." });
            }
        }).catch((err) => {
            res.status(500).json({ err: true, msg: err });
        })
    } else {
        res.status(500).json({ err: true, msg: "Invalid Page Number." });
    }
}
exports.getChatList = (req, res) => {
    getListOfUserId(req.params.userId).then((chatIds) => {
        user.find({ _id: { $in: chatIds } }).then((chatList) => {
            res.status(200).json({ err: false, msg: "Successfully retrieve", chatUsers: chatList });
        }).catch((err) => {
            res.status(500).json({ err: true, msg: err });
        });
    }).catch((err) => {
        res.status(500).json({ err: true, msg: err });
    })
}
function getListOfUserId(userId) {
    let chatUsers = []
    return new Promise((resolve, reject) => {
        chat.find({ $or: [{ senderId: ObjectID(userId) }, { receiverId: ObjectID(userId) }] }).sort({ createdAt: -1 }).then((chatList) => {
            for (let chat of chatList) {
                if (chat.senderId.toString() !== userId.toString()) {
                    if (!chatUsers.includes(chat.senderId.toString())) {
                        chatUsers.push(chat.senderId.toString());
                    }
                }
                if (chat.receiverId.toString() !== userId.toString()) {
                    if (!chatUsers.includes(chat.receiverId.toString())) {
                        chatUsers.push(chat.receiverId.toString());
                    }
                }
            }
            resolve(chatUsers);
        }).catch((err) => {
            console.log("error", err)
            reject(err);
        });
    });
}
exports.getChatListWithChat = (req, res) => {
    getListOfUserId(req.params.userId).then((chatIds) => {
        chatIds = chatIds.map(function (el) { return mongoose.Types.ObjectId(el) })
        let chatUser = []
        count = 0;
        chatIds.forEach((chatId) => {
            user.findOne({ _id: ObjectID(chatId) }).then((userFound) => {
                chat.findOne({
                    $or: [{ senderId: ObjectID(chatId), receiverId: ObjectID(req.params.userId) },
                    { senderId: ObjectID(req.params.userId), receiverId: ObjectID(chatId) }]
                }).sort({ createdAt: -1 }).then((chatsFound) => {
                    count++
                    let user = {
                        _id: userFound._id,
                        name: userFound.name,
                        email: userFound.email,
                        password: userFound.password,
                        profilePhoto: userFound.profilePhoto,
                        gender: userFound.gender,
                        isOnline: userFound.isOnline,
                        lastSeen: userFound.lastSeen,
                        socketId: userFound.socketId,
                        createdAt: userFound.createdAt,
                        updatedAt: userFound.updatedAt,
                        chats: {
                            senderId: chatsFound.senderId,
                            receiverId: chatsFound.receiverId,
                            message: chatsFound.message,
                            createdAt: chatsFound.createdAt,
                            updatedAt: chatsFound.updatedAt,
                        }
                    }
                    chatUser.push(user)
                    if (count == chatIds.length) {
                        res.status(200).json({ err: false, msg: "Successfully retrieve", chatUsers: chatUser });
                    }
                }).catch((err) => {
                    console.log(err);
                    res.status(500).json({ err: true, msg: err });
                })
            }).catch((err) => {
                console.log(err);
                res.status(500).json({ err: true, msg: err });
            });
        });
    }).catch((err) => {
        console.log(err);
        res.status(500).json({ err: true, msg: err });
    });
}