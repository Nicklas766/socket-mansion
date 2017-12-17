
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

// use chat module, but have another name so we can test
// if it still works with different name
const game = require('../src/chat').chat;

// Will be used as parameter for socketContainer
const modules = [{module: chat, name: "chat"}, {module: game, name: "game"}];


var socketURL = 'http://localhost:3000';
var options = {
    transports: ['websocket'],
    'force new connection': true
};



describe("socket-container with two modules", function() {
    before(function() {
        socketContainer(server, modules);
        server.listen(3000);
    });

    after(function(done) {
        server.close();
        done();
    });

    it('should create gameroom, chatroom with game,chat. Try to join both', function(done) {
        // Start socket
        var socket = io(socketURL, options);

        socket.on('connect', function() {
            socket.emit('setup user', {name: "Night Elf"});
            socket.emit('create room', 'gameroom', 'game');
            socket.emit('create room', 'chatroom', 'chat');
            socket.emit('join room', 'gameroom');
            socket.emit('join room', 'chatroom');
            socket.emit('get rooms');
        });

        socket.on("get rooms", function(data) {
            assert.equal(data[0].id, "gameroom");
            assert.equal(data[0].users[0].user.name, "Night Elf");
            assert.equal(data[1].id, "chatroom");
            assert.equal(data[1].users[0].user.name, "Night Elf");
            socket.disconnect();
            done();
        });
    });

    it('should create coolchat two times and try to join two times', function(done) {
        // Start socket
        var socket = io(socketURL, options);

        socket.on('connect', function() {
            socket.emit('setup user', {name: "James Bond"});
            socket.emit('create room', 'coolchat', 'game');
            socket.emit('create room', 'coolchat', 'game');
            socket.emit('join room', 'coolchat');
            socket.emit('join room', 'coolchat');
            socket.emit('get rooms');
        });

        socket.on("get rooms", function(data) {
            assert.equal(data[2].id, "coolchat");
            assert.equal(data[2].users[0].user.name, "James Bond");
            socket.disconnect();
            done();
        });
    });
});
