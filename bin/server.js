var config = require('../etc/server.json'),
	SocketServer = require('../lib/socketserver.js').SocketServer,
	app = new SocketServer(config.data,config.host,config.port,config['ws-host'],config['ws-port']),
	wss = app.WebSocketServer,
	fs = require('fs');
process.chdir(__dirname+'/..');
app.path('/etc/settings.json',function(req,res){
	res.writeHead(200,{
		"Content-Type": 'application/json'
	});
	fs.readFile('etc/client.json',function(e,d){
		if(!e){
			try{
				d = JSON.parse(d);
				d.websocket = {
					host: ws_host,
					port: ws_port
				};
				res.end(JSON.stringify(d));
			}catch(err){
				e = err;
			}
		}
		if(e){
			res.end("{\"debug\": false}");
		}
	});
});