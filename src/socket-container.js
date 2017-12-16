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

const getModule  = (name) => this.modules.filter(module => name == module.name)[0].module;
const getRoom    = (id)  => this.rooms.filter(room => id == room.id)[0];
const getUser    = (id) => this.users.filter(user => id == user.id)[0];
const removeUser = (arr, id) => arr.filter(user => user.id != id);

/**
* Setup user and adds it to the this.users array
*/
const setupUser = (socket) => {
    socket.on('setup user', (user) => {
        console.log(user)
        this.users.push({
            id: socket.id,
            socket: socket,
            user: user
        });
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
      console.log(`room ${id} created`);
      this.rooms.push({
            module: new module(this.io, id),
            id: id,
            users: []
          });
    });
    // Joins the room
    socket.on('join room', (id) => {
        const user = this.users.filter(user => socket.id == user.id)[0];
        console.log(user);
        let room = getRoom(id);
        // Add new user into this.rooms[].users
        this.rooms = this.rooms.map(room => id == room.id ? Object.assign(room, {users: room.users.concat(user)}) : room);

        // setup room events for socket
        socket.join(id);
        room.module.setup(user);
        console.log('Someone joined room: ', id);
    });

    // Leaves room
    socket.on('leave room', (id) => {
        let roomObj = getRoom(id);

        // Remove user from this.rooms[].users
        roomObj.users = room.users.filter(user => user.id != socket.id);
        this.rooms    = this.rooms.map(room => id == room.id ? roomObj : room);

        // Remove events for socket and leave room
        room.module.off(socket);
        socket.leave(id);
    });
};

const setupGet = (socket) => {
  socket.on('get users', () => {
      this.io.emit('get users', this.users);
  });
  socket.on('get rooms', () => {
      this.io.emit('get rooms', this.rooms);
  });
}
/**
* Disconnects the socket and removes the user from this.users based on socket.id
*/
const disconnect = (socket) => {
    socket.on('disconnect', () => {
        console.log(socket.id + ' disconnected');

        // Remove user from all rooms and events for socket
        for (let room of this.rooms) {
          room.users = removeUser(room.users, socket.id);
          room.module.off(socket);
        }
        this.users = removeUser(this.users, socket.id);


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
    this.users   = [];       // Contains all the users connected
    this.rooms   = [];       // Contains all rooms, such as chat, game, etc.

    console.log(modules);

    /**
    * @param socket socket object
    * @param user object
    */
    this.io.on('connection', (socket) => {
        console.log("New client connected with id : " + socket.id);

        setupUser(socket);
        setupRoom(socket);
        setupGet(socket);

        disconnect(socket);

    });
};
module.exports = { socketContainer };
