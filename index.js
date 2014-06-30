#!/usr/bin/env node
var app = require('./bin/server.js'),
	config = require('./etc/server.json');
app.start(config.port,config.hostname);