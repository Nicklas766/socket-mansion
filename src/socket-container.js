const io   = require('socket.io');

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
const removeUser = (arr, id) => arr.filter(user => user.id != id);

/**
* Setup user and adds it to the this.users array
*/
const setupUser = (socket) => {
    socket.on('setup user', (user) => {
        // console.log(user);
        this.users.push({
            id: socket.id,
            user: user
        });
    });
};


const createRoom = (socket) => {
    /**
    * Creates a room with a module
    * @param id string
    * @param moduleName string
    */
    socket.on('create room', (id, moduleName) => {
        const module = getModule(moduleName);

        // Check if room exists
        if (getRoom(id) !== undefined) {
            console.log(`Error: ${id} already exist`);
            return false;
        }

        var room = {
            module: new module(this.io, id),
            id: id,
            users: []
        };

        // console.log(`room ${id} created`);
        this.rooms.push(room);
    });
};

const joinRoom = (socket) => {
    // Joins the room
    socket.on('join room', (id) => {
        const user = this.users.filter(user => socket.id == user.id)[0];

        let room = getRoom(id);
        // If room undefined or user not in room then return false

        if (room == undefined) {
            console.log(`Error: ${id} doesn't exist`);
            return false;
        }
        if (room.users.includes(user)) {
            console.log(`Error: socket already in room`);
            return false;
        }
        // Add new user into this.rooms[].users

        this.rooms = this.rooms.map(room =>
            id == room.id ? Object.assign(room, {users: room.users.concat(user)}) : room
        );

        // setup room events for socket
        socket.join(id);
        room.module.setup(socket, user);
        // console.log('Someone joined room: ', id);
    });
};

const leaveRoom = (socket) => {
    // Leaves room
    socket.on('leave room', (id) => {
        let roomObj = getRoom(id);

        // Remove events for socket and leave room
        roomObj.module.off(socket);
        socket.leave(id);

        // Remove user from this.rooms[].users
        roomObj.users = roomObj.users.filter(user => user.id != socket.id);
        this.rooms = this.rooms.map(room => id == room.id ? roomObj : room);
    });
};

const setupGet = (socket) => {
    socket.on('get users', () => {
        this.io.emit('get users', this.users);
    });
    socket.on('get rooms', () => {
        // Remove modules before sending to client
        const rooms = this.rooms.map((room) => ({id: room.id, users: room.users}));

        this.io.emit('get rooms', rooms);
    });
};
/**
* Disconnects the socket and removes the user from this.users based on socket.id
*/
const disconnect = (socket) => {
    socket.on('disconnect', () => {
        // console.log(socket.id + ' disconnected');

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
    */
    this.io.on('connection', (socket) => {
        // console.log("New client connected with id : " + socket.id);

        setupUser(socket);
        createRoom(socket);
        joinRoom(socket);
        leaveRoom(socket);
        setupGet(socket);

        disconnect(socket);
    });
};

module.exports = { socketContainer };
