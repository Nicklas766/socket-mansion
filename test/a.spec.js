
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
const {socketContainer}  = require('../src/socket-container');
const modules            = [{module: chat, name: "chat"}]; // Will be used as parameter for socketContainer


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


    it('should connect', function(done) {
        // Start socket
        var socket = io(socketURL, options);

        socket.on('connect', function() {
            assert.equal(true, socket.connected);
            socket.disconnect();
            done();
        });
    });

    it('should get user', function(done) {
        // Start socket
        var socket = io(socketURL, options);

        socket.on('connect', function() {
            socket.emit('setup user', {name: "nicklas"});
            // socket.emit('create room', 'room1', 'chat');
            socket.emit('get users');
        });

        socket.on("get users", function(data) {
            assert.equal(data[0].user.name, "nicklas");
            socket.disconnect();
            done();
        });
    });


    it('should create room1 and it should have no users', function(done) {
        // Start socket
        var socket = io(socketURL, options);

        socket.on('connect', function() {
            socket.emit('setup user', {name: "nicklas"});
            socket.emit('create room', 'room1', 'chat');
            socket.emit('get rooms');
        });

        socket.on("get rooms", function(data) {
            assert.equal(data[0].id, "room1");
            assert.equal(data[0].users.length, 0);
            socket.disconnect();
            done();
        });
    });

    it('should create studio room and should contain Jason Mraz', function(done) {
        // Start socket
        var socket = io(socketURL, options);

        socket.on('connect', function() {
            socket.emit('setup user', {name: "Jason Mraz"});
            socket.emit('create room', 'studio', 'chat');
            socket.emit('join room', 'studio');
            socket.emit('get rooms');
        });

        socket.on("get rooms", function(data) {
            assert.equal(data[1].id, "studio");
            assert.equal(data[1].users[0].user.name, 'Jason Mraz');
            socket.disconnect();
            done();
        });
    });

    it('Enya should first join studio room and then leave it', function(done) {
        // Start socket
        var socket = io(socketURL, options);

        socket.on('connect', function() {
            socket.emit('setup user', {name: "Enya"});
            socket.emit('join room', 'studio');
            socket.emit('leave room', 'studio');
            socket.emit('get rooms');
        });

        socket.on("get rooms", function(data) {
            assert.equal(data[1].id, "studio");
            assert.equal(data[1].users.length, 0);
            socket.disconnect();
            done();
        });
    });
});
