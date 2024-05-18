const ObjectID = require('mongodb').ObjectId;
const user = require('./_models/user.model');
const chat = require('./_models/chat.model');
module.exports = (myObject) => {
    let server = myObject.server
    let app = myObject.app
    var io = require("socket.io")(server, {
        transports: ['websocket'],
        allowUpgrades: false,
        pingInterval: 25000,
        pingTimeout: 60000,
    });
    app.set('socketio', io);

    // socket connection
    io.on("connection", (socket) => {
        //update socket id
        socket.on('update_socket_id', (usr) => {
            let data = new Date()
            user.updateOne({ _id: usr.userId }, { $set: { socketId: socket.id, isOnline: true, lastSeen: data } }).then(() => {
                socket.emit('update_socket_id', { err: false, msg: "Socket id has been successfully updated." })
            }).catch((err) => {
                socket.emit('update_socket_id', { err: true, msg: err });
            });
        });

        // socket disconnect
        socket.on('disconnect', reason => {
            // offline
            user.findOne({ socketId: socket.id }).then((result) => {
                let data = new Date()
                if (result == null) {
                    console.log('user not found in offline disconnect.')
                } else {
                    user.updateOne({ _id: result._id }, { isOnline: false, lastSeen: data }).then((updated) => {
                    }).catch((err) => {
                        console.log(err);
                    });
                }
            }).catch((err) => {
                console.log(err)
            })
        });

        // direct chats between two users
        socket.on('send_message', (msg) => {
            let ins = new chat({
                senderId: ObjectID(msg.senderId),
                receiverId: ObjectID(msg.receiverId),
                message: msg.message,
            });
            ins.save().then((created) => {
                if (created !== null) {
                    user.findOne({ _id: ObjectID(msg.receiverId) }).then((receiver) => {
                        if (receiver != null) {
                            io.to(receiver.socketId).emit('receive_message', { err: false, message: created.message });
                        } else {
                            io.emit('receive_message', { err: true, msg: "user not found" });
                        }
                    }).catch((err) => {
                        io.emit('receive_message', { err: true, msg: err });
                    });
                } else {
                    io.emit('receive_message', { err: true, data: "something went wrong" });
                }
            }).catch((err) => {
                io.emit('receive_message', { err: true, msg: err });
            });
        });

    });
}