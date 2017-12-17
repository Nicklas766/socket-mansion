const getUser = (arr, id) => arr.filter(user => id == user.id)[0];

/**
* Chat
* @param io object
* @param id string
*/
function chat(io, id) {
    this.io       = io;
    this.id       = id;
    this.messages = [{text: `Room ${id} has been created`, name: "server"}];
    this.users    = [];
}

const createMessage = ({ text='', name='server', date=Date.now() }) => ({
    text,
    name,
    date
});

chat.prototype.message = function (socket) {
    const user = getUser(this.users, socket.id);

    socket.on(`message ${this.id}`, (text) => {
        const msg     = createMessage({text: text, name: user.name});

        this.messages = this.messages.concat(msg); // Save

        this.io.sockets.in(this.id).emit(`message ${this.id}`, this.messages); // Emit
    });
};

// Greet new user connected
chat.prototype.greet = function (name) {
    const msg = createMessage({text: `${name} has joined the server, welcome!`});

    this.messages = this.messages.concat(msg); // Save

    this.io.sockets.in(this.id).emit(`message ${this.id}`, this.messages); // Emit
};

/**
* Connect user to the chat, save socket so we can use it
* @param user object
* @param socket object
*/


chat.prototype.setup = function (socket, userObj) {
    // add new user
    const user = {name: userObj.user.name, id: socket.id};

    this.users = this.users.concat(user);

    // setup events
    this.message(socket);
    this.greet(user.name);
};
chat.prototype.off = function (socket) {
    socket.removeAllListeners(`message ${this.id}`); // Remove events for socket
    this.users = this.users.filter(user => user.id != socket.id); // Remove user
};

module.exports = { chat };
