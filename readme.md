# Socket-Mansion

Socket-Mansion help you easily connect your users to rooms, so you can focus on
coding for the actual room function.

You should see your socket-mansion as a container for all rooms, while the modules
you inject are rooms, you decide the states of the rooms.


## Needed to work
Your room-modules needs to return a `setup(socket)`, so we can add the events of
the module to the socket. You'll also need to return a `off(socket)`, so we can
unsubscribe all events when you leave the room.


## Good to know before we get started

### Server

**Room**
```javascript
// Your room modules need to have, io and id as parameters.
function room(io, id) {
    this.io = io;
    this.id = id;
};
```

**Setup user in mansion**
```javascript
// You need to setup user before emitting anything else
socket.emit(`setup user`, userObj)            // Client emits
{id: socket.id, socket: socket, user: userObj} // Server saves
```

**When user joins room**
```javascript
// Your module needs to have a "setup(userObj)", which is called on join
room.prototype.setup = function (userObj) {
    const socket = userObj.socket;
    const user = {name: userObj.user.name, id: socket.id};
}
```

**When user leaves room**
```javascript
// Your module needs to have an "off(socket)", which is called on leave
room.prototype.off = function (socket) {
    socket.off(`my event`); // Remove events for socket
}
```

```javascript
// How to setup the rooms
var http               = require('http');
var app                = require('../app');
const {socketMansion}  = require('socket-mansion');
const chat             = require('../src/chat').chat;
const game             = require('../src/game').game;

const modules = [
    {
        module:chat,
        name:"chat"
    },
    {
        module:game,
        name:"game"
    },
]
var server = http.createServer(app);
socketMansion(server, modules);
```

### Client (with react)

socket-mansion has setup some events for you already, you can see some examples
with react below,
```javascript
componentDidMount() {
    const {socket, user} = this.state;

    socket.on('get users', (users) => {
        this.setState({users: users});
    });

    socket.on('get rooms', (rooms) => {
         this.setState({rooms: rooms});
    });

    socket.emit('setup user', user);
}
// NOTE: we declare the event, id then which module the room should use
createRoom() {
     this.state.socket.emit('create room', this.state.room, 'chat');
}

joinRoom() {
    this.state.socket.emit('join room', this.state.room);
    this.setState({inRoom: true});
}
leaveRoom() {
    this.state.socket.emit('leave room', this.state.room);
    this.setState({inRoom: false});
}

```
## Examples

Instead of me posting lots of code, then please checkout

[Chat (server)](https://github.com/Nicklas766/socket-mansion/blob/master/src/chat.js)

[Choose room (client)](https://github.com/Nicklas766/socket-mansion/blob/master/client/app/compontents/page/Home.js)

[Chat room (client)](https://github.com/Nicklas766/socket-mansion/blob/master/client/app/compontents/page/Chat.js)
