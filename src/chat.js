const io   = require('socket.io');




const getUser = (id) => this.users.filter(user => id == user.id)[0];

/**
* Connect user to the chat, save socket so we can use it
* @param user object
* @param socket object
*/
const connect = (user, socket) => {
    this.users.push({user: user, socket: socket, typing: false});

    this.messages.push({text: `${user} has joined the server`, name: "server"});
}


const message = (socket) => {
    socket.to(this.id).emit('message', 'what is going on, party people?');
}

const ping = (socket) => {
    socket.on('ping ' + this.id, () => {
      console.log("Room  has been pinged", this.id);
    });
}

/**
* Main container for the socketChat
* @param room socket object
* @param users array of user object
*/
const chat = (id) => {
    this.id = id;
    this.messages = [];

    return {
        setup(socket) {
            ping(socket);
        },
        off(socket) {
            socket.off('ping' + this.id);
        }
    };


};

module.exports = { chat };
