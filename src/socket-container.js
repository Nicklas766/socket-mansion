const io   = require('socket.io');
const chatModule = require('./chat.js');
/**
*
* Main container for the socket
*
*
* Lets a client connect with an own socket id
*
* emit('get users', this.users) sends users to client
*
*/


const getUser   = (id) => this.users.filter(user => id == user.id)[0];
const getRoom   = (id)  => this.rooms.filter(room => id == room.id)[0];
const getModule = (name) => this.modules.filter(module => name == module.name)[0].module;

/**
* Setup user and adds it to the this.users array
*/
const setupUser = (socket) => {
    socket.on('setup user', (user) => {
        this.users.push({
            id: socket.id,
            user: user
        });
        this.io.emit('get users', this.users);
    });
};


/**
* Room events
*
* A room symbolizes a place where sockets are in or not.
*
*/
const setupRoom = (socket) => {
    /**
    * Creates a room with a module
    * @param id string
    * @param moduleName string
    */
    socket.on('create room', (id, moduleName) => {
      const module = getModule(moduleName);


      this.rooms.push({
            module: module(id),
            id: id,
            users: []
          });
          console.log(this.rooms)
    });
    // Joins the room
    socket.on('join room', (id) => {
        const user = getUser(socket.id);
        let room = getRoom(id);
        room.users.push(user);

        // setup room events for socket
        room.module.setup(socket);
        console.log("Someone joined room: ", id);

        this.rooms = this.rooms.map(room => id == room.id ? Object.assign(room, {users: room.users}) : room);
        socket.join(id);

    });

    // Leaves the room
    socket.on('leave room', (id) => {
        const user = getUser(socket.id);
        const room = getRoom(id);

        room.module.off(socket);

        // Remove user
        const newRoom = room.users.filter(user => user.id != socket.id);

        // Update room in array
        this.rooms = this.rooms.map(room => id == room.id ? newRoom : room);
        socket.leave(id);
    });
};


/**
* Disconnects the socket and removes the user from this.users based on socket.id
*/
const disconnect = (socket) => {
    socket.on('disconnect', () => {
        console.log(socket.id + ' disconnected');

        this.users = this.users.filter(user => socket.id != user.id);
        this.io.emit('get users', this.users);
    });
};
/**
* @param server server
* @param modules array of modules
*/
const socketContainer = (server, modules) => {
    this.io = new io(server);

    this.modules = modules;  // Contains all injected modules
    this.users   = [];  // Contains all the users
    this.rooms   = [];  // Contains all rooms, such as chat, game, etc.

    console.log(modules);

    /**
    * @param socket socket object
    * @param user object
    */
    this.io.on('connection', (socket) => {
        console.log("New client connected with id : " + socket.id);

        setupUser(socket);
        setupRoom(socket);

        disconnect(socket);

    });
};
module.exports = { socketContainer };
