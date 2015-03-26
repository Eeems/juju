var config = require('../etc/server.json'),
	SocketServer = require('../lib/socketserver.js').SocketServer,
	app = new SocketServer(config.data,config.port,config.host,config['ws-host'],config['ws-port']),
	wss = app.WebSocketServer,
	fs = require('fs');
process.chdir(__dirname+'/..');
app.path('/settings.json',function(req,res){
	res.writeHead(200,{
		"Content-Type": 'application/json'
	});
	fs.readFile('etc/client.json',function(e,d){
		if(!e){
			try{
				d = JSON.parse(d);
				d.websocket = app.config.websocket;
				res.end(JSON.stringify(d));
			}catch(err){
				e = err;
			}
		}
		if(e){
			console.error(e);
			res.end("{\"debug\": false}");
		}
	});
});