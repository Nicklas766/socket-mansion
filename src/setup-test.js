
var io        = require('socket.io-client');


/**
* setupRoomTest is made for testing rooms for the main module "socket-mansion".
* Lets you easily setup a test for your room module with mocha.
*
* @param {object} object
*
*
*/
function setupRoomTest(object) {
    const {socketURL, options, func, done, room, module} = object;

    // Setup client
    var client1 = io(socketURL, options);

    client1.on('connect', () => {
        var client2  = io(socketURL, options);

        client2.on('connect', () => {
            client1.emit('setup user', {name: "player1"});
            client2.emit('setup user', {name: "player2"});

            client1.emit(`create room`, `${room}`, module);

            client1.emit('join room', `${room}`);
            client2.emit('join room', `${room}`);

            // do test
            const doFunc = func(client1, client2);

            doFunc(done);
        });
    });
}

module.exports = {setupRoomTest};
