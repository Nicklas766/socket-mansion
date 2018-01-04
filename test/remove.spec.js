
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
var io                   = require('socket.io-client');
const chat               = require('../src/chat').chat;
const socketContainer    = require('../index.js');

// Will be used as parameter for socketContainer
const modules = [{module: chat, name: "chat"}];


var socketURL = 'http://localhost:3000';
var options = {
    transports: ['websocket'],
    'force new connection': true
};



describe("socket-container with chat module as room", function() {
    before(function() {
        socketContainer(server, modules);
        server.listen(3000);
    });

    after(function(done) {
        server.close();
        done();
    });


    it('should create room1 & room2 and then remove room1', function(done) {
        // Start socket
        var socket = io(socketURL, options);

        socket.on('connect', function() {
            socket.emit('setup user', {name: "nicklas"});
            socket.emit('create room', 'room1', 'chat');

            var socket2 = io(socketURL, options);

            socket2.on('connect', function() {
                socket2.emit('create room', 'room2', 'chat');
                socket2.emit('get rooms');

                socket2.on("get rooms", function(data) {
                    console.log(data);
                    assert.equal(data[0].id, "room1");
                    assert.equal(data[1].id, "room2");

                    socket.emit('remove room', 'room1');
                    socket.emit('get rooms');
                    socket.on("get rooms", function(data) {
                        assert.equal(data[0].id, "room2");
                        socket.disconnect();
                        socket2.disconnect();
                        done();
                    });
                });
            });
        });
    });

    it('should create create room 10, 11, 12 and then remove room11', function(done) {
        // Start socket
        var socket = io(socketURL, options);

        socket.on('connect', function() {
            socket.emit('setup user', {name: "nicklas"});
            socket.emit('create room', 'room10', 'chat');

            var socket2 = io(socketURL, options);

            socket2.on('connect', function() {
                socket2.emit('create room', 'room11', 'chat');
                socket2.emit('create room', 'room12', 'chat');
                socket2.emit('get rooms');

                socket2.on("get rooms", function(data) {
                    assert.equal(data[0].id, "room2");
                    assert.equal(data[1].id, "room10");
                    assert.equal(data[2].id, "room11");
                    assert.equal(data[3].id, "room12");

                    socket.emit('remove room', 'room11');
                    socket.emit('get rooms');
                    socket.on("get rooms", function(data) {
                        assert.equal(data[0].id, "room2");
                        assert.equal(data[1].id, "room10");
                        assert.equal(data[2].id, "room12");
                        socket.disconnect();
                        socket2.disconnect();
                        done();
                    });
                });
            });
        });
    });
});
