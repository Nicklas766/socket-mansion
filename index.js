'use strict';

const mansion = require('./src/socket-container').socketContainer;

mansion.setupRoomTest = require('./src/setup-test.js').setupRoomTest;

module.exports = mansion;
