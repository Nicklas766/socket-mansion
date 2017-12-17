# Socket-Mansion
[![Build Status](https://travis-ci.org/Nicklas766/socket-mansion.svg?branch=master)](https://travis-ci.org/Nicklas766/socket-mansion)
[![Code Coverage](https://scrutinizer-ci.com/g/Nicklas766/socket-mansion/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/Nicklas766/socket-mansion/?branch=master)
[![Build Status](https://scrutinizer-ci.com/g/Nicklas766/socket-mansion/badges/build.png?b=master)](https://scrutinizer-ci.com/g/Nicklas766/socket-mansion/build-status/master)
[![Maintainability](https://api.codeclimate.com/v1/badges/691a969af6b675e62128/maintainability)](https://codeclimate.com/github/Nicklas766/socket-mansion/maintainability)

Socket-Mansion helps you connect your sockets to rooms, while also keeping check
on where your users are.

This lets you focus on the actual function of the room instead of worrying about
connections.

You should see your socket-mansion as a container for all rooms, while the modules
you inject are rooms, you decide the states of the rooms.


## How to use (in 4 steps)

### Step 1. Create room

**Constructor:**
Your room modules need to have, io and id as parameters.
```javascript
function room(io, id) {
    this.io = io
    this.id = id
}
```

**User joins:**
When a user joins the room, `room.setup(socket, userObj)` will be called. An example
how your setup function can look like.
```javascript
room.prototype.setup = function (socket, userObj) {
    const user = {name: userObj.user.name, id: socket.id}
    socket.emit("hello mansion", "Hey all! I joined a room.");
}
```

**User leaves:**
When a user leaves the room, `room.off(socket)` will be called. This is a good
time to maybe update your rooms state, or remove events for the socket. Example:
```javascript
room.prototype.off = function (socket) {
    socket.off(`my event`)
}
```

### Step 2. Add your room module to the mansion before server.listen()


```javascript
var http               = require('http')
var app                = require('../app')
const {socketMansion}  = require('socket-mansion')
const chat             = require('../src/chat').chat
const game             = require('../src/game').game

const modules = [
    {
        module: chat,
        name: "chat"
    },
    {
        module: game,
        name: "game"
    },
]
var server = http.createServer(app)
socketMansion(server, modules)
```


### Step 3. Client side

The mansion has some events already created for you, so you can easily connect
to your room-events. Before I show you, make sure you setup your user before
using any emits.

**Setup user:**
```javascript
socket.emit(`setup user`, userObj)  // Client emits
{id: socket.id, user: userObj}      // Server saves
```

**Events:**
Here are the events, as you can see on the `create room` we have a third argument
which is the modules name you want to use.

```javascript

    socket.on('get users', (users) => {
        //receive users from mansion
    })

    socket.on('get rooms', (rooms) => {
        //receive rooms, which contains the users and the id of room
    })

    socket.emit('get users') // Triggers above
    socket.emit('get rooms') // Triggers above

    socket.emit('create room', 'name', 'chat')
    socket.emit('join room', 'name')
    socket.emit('leave room', 'name')


```

### Step 4. Wait.. won't my room events be the same if I create a new room with the same module?
Yes you are correct, to fix this we can use the `id` that we get in our room
constructor. Then we can do something like this

```javascript
// "room chat" function on server-side
chat.prototype.message = function (socket) {
    socket.on(`message ${this.id}`, (text) => {
        // All clients in room gets this message
        this.io.sockets.in(this.id).emit(`new ${this.id}`, text)
    })
}
// client
socket.on(`new ${roomId}`, (text) => {
    console.log(text)
})
socket.emit(`new ${roomId}`, "hello!")
// hello!
```

## Example with React

Instead of me posting lots of code, then please checkout

[Chat (server)](https://github.com/Nicklas766/socket-mansion/blob/master/src/chat.js)

[Choose room (client)](https://github.com/Nicklas766/socket-mansion/blob/master/client/app/compontents/page/Home.js)

[Chat room (client)](https://github.com/Nicklas766/socket-mansion/blob/master/client/app/compontents/page/Chat.js)
