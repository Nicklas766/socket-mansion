
// For testing suite
/*eslint-disable no-unused-vars*/
var assert   = require("assert");
var mocha    = require('mocha');
var it       = mocha.it;
var describe = mocha.describe;
var before   = mocha.before;
var after    = mocha.after;
/*eslint-enable no-unused-vars*/

// Create a server
var app = require('express')();
var http  = require('http');
var server = http.createServer(app);

// socket.io and socket-container module
const chat               = require('../src/chat').chat;
const socketMansion      = require('../index.js');
const setupRoomTest      = require('../index.js').setupRoomTest;


// Will be used as parameter for socketContainer
const modules = [{module: chat, name: "chat"}];


var socketURL = 'http://localhost:3000';
var options = {
    transports: ['websocket'],
    'force new connection': true
};


describe("Try out the setupRoomTest function with some simple tests", () => {
    before(() => {
        socketMansion(server, modules);
        server.listen(3000);
    });

    after((done) => {
        server.close();
        done();
    });

    it('Should create room1 with chat module and have player1 and player2', (done) => {
        const testFunc = (client1, client2) => (done) => {
            client2.on('message room1', (messages) => {
                assert.equal(messages[0].text, 'Room room1 has been created');
                assert.equal(messages[1].text, 'player1 has joined the server, welcome!');
                assert.equal(messages[2].text, 'player2 has joined the server, welcome!');

                client1.disconnect();
                client2.disconnect();
                done();
            });
        };

        setupRoomTest({
            socketURL: socketURL,
            options: options,
            func: testFunc,
            done: done,
            room: 'room1',
            module: 'chat'
        });
    });
});
