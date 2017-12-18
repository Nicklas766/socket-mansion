
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



describe("should do lots of stuff with different clients to see if something breaks", function() {
    before(function() {
        socketContainer(server, modules);
        server.listen(3000);
    });

    after(function(done) {
        server.close();
        done();
    });

    it('should create six clients and create two rooms and join them', function(done) {
        // Start socket
        var client1, client2, client3, client4, client5, client6;

        function completeTest() {
            client1.disconnect();
            client2.disconnect();
            client3.disconnect();
            client4.disconnect();
            client5.disconnect();
            client6.disconnect();
            done();
        }

        client1 = io(socketURL, options);
        // We want to execute the events in a certain order. Therefore we nest
        // the connects to make sure the calls always gets executed correctly.
        client1.on('connect', () => {
            client2 = io(socketURL, options);
            client2.on('connect', () => {
                client3 = io(socketURL, options);
                client3.on('connect', () => {
                    // Setup, Create, Join with star wars crew.
                    client1.emit('setup user', {name: "Luke Skywalker"});
                    client2.emit('setup user', {name: "Darth Vader"});
                    client3.emit('setup user', {name: "Han Solo"});

                    client1.emit('create room', 'star wars', 'game');

                    client1.emit('join room', 'star wars');
                    client2.emit('join room', 'star wars');
                    client3.emit('join room', 'star wars');

                    client4 = io(socketURL, options);
                    // For expendables crew
                    client4.on('connect', () => {
                        client5 = io(socketURL, options);
                        client5.on('connect', () => {
                            client6 = io(socketURL, options);
                            client6.on('connect', () => {
                                // Client 6 will check rooms for us
                                client6.on("get rooms", function(data) {
                                    assert.equal(data[0].id, "star wars");
                                    assert.equal(data[1].id, "expendables");
                                    completeTest();
                                });

                                // Setup, Create, Join with expendables crew.
                                client4.emit('setup user', {name: "Arnold"});
                                client5.emit('setup user', {name: "Stallone"});
                                client6.emit('setup user', {name: "Terry Crews"});

                                client4.emit('create room', 'expendables', 'game');

                                client4.emit('join room', 'expendables');
                                client5.emit('join room', 'expendables');
                                client6.emit('join room', 'expendables');

                                // Get the rooms
                                client6.emit('get rooms');
                            });
                        });
                    });
                });
            });
        });
    });

    it('should let 6 clients join the rooms above and message each other', function(done) {
        // Start socket
        var client1, client2, client3, client4, client5, client6;

        function completeTest() {
            client1.disconnect();
            client2.disconnect();
            client3.disconnect();
            client4.disconnect();
            client5.disconnect();
            client6.disconnect();
            done();
        }
        function setupStarWars() {
            client1.emit('setup user', {name: "Luke Skywalker"});
            client2.emit('setup user', {name: "Darth Vader"});
            client3.emit('setup user', {name: "Han Solo"});

            client1.emit('create room', 'chatroom', 'chat');

            client1.emit('join room', 'chatroom1337'); // doesnt exist
            client1.emit('join room', 'chatroom');
            client1.emit('message chatroom', 'Hello World!');
            client2.emit('join room', 'chatroom');
            client3.emit('join room', 'chatroom');
        }

        function setupExpendables() {
            client4.emit('setup user', {name: "Arnold"});
            client5.emit('setup user', {name: "Stallone"});
            client6.emit('setup user', {name: "Terry Crews"});

            client4.emit('join room', 'expendables');
            client4.emit('message expendables', 'ill be back');
            client4.emit('leave room', 'expendables');
            client5.emit('join room', 'expendables');
            client6.emit('join room', 'expendables');
        }

        client1 = io(socketURL, options);
        // We want to execute the events in a certain order. Therefore we nest
        // the connects to make sure the calls always gets executed correctly.
        client1.on('connect', () => {
            client2 = io(socketURL, options);
            client2.on('connect', () => {
                client3 = io(socketURL, options);
                client3.on('connect', () => {
                    setupStarWars();



                    client3.on("message chatroom", function(data) {
                        assert.equal(data[0].text, "Room chatroom has been created");
                        assert.equal(data[1].text, "Luke Skywalker has joined" +
                        " the server, welcome!");

                        assert.equal(data.length, 5);

                        assert.equal(data[2].text, "Hello World!");
                        assert.equal(data[2].name, "Luke Skywalker");
                    });



                    client4 = io(socketURL, options);
                    // For expendables crew
                    client4.on('connect', () => {
                        client5 = io(socketURL, options);
                        client5.on('connect', () => {
                            client6 = io(socketURL, options);
                            client6.on('connect', () => {
                                setupExpendables();

                                client6.on("message expendables", function(data) {
                                    assert.equal(data[0].text, "Room expendables has been created");
                                    assert.equal(data[4].text, "Arnold has joined" +
                                    " the server, welcome!");
                                    assert.equal(data[5].text, "ill be back");
                                    assert.equal(data[5].name, "Arnold");
                                    completeTest();
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
