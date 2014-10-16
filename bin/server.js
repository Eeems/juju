var fs = require('fs'),
	app = require('node-static'),
	http = require('http'),
	ws = require('ws'),
	config = require('../etc/server.json');
process.chdir(__dirname+'/..');
console.log('Running from context '+process.cwd());
exports.start = function(folder,port,host,ws_host,ws_port){
	console.log('Starting server for '+folder+' on '+host+':'+port);
	console.log('Starting websocket server on '+ws_host+':'+ws_port);
	var file = new app.Server(folder,{
			gzip: true,
			serverInfo: 'juju/node-static/0.0.1'
		}),
		sockets = [],
		wss = new ws.Server({
			host: ws_host,
			port: ws_port
		}),
		server = http.createServer(function(req,res){
			if(req.url == '/etc/settings.json'){
				console.log('Serving client settings');
				res.writeHead(200,{
					"Content-Type": 'application/json'
				});
				fs.readFile('etc/client.json',function(e,d){
					if(!e){
						try{
							d = JSON.parse(d);
							console.log('  Settings have no errors');
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
						console.log('  Settings have errors');
						console.error(e);
						res.end("{\"debug\": false}");
					}
				});
			}else if(req.url.substr(0,7) == '/debug/'){
				var type = req.url.substr(7,req.url.indexOf('/',7)-7),
					data = decodeURIComponent(req.url.substr(req.url.indexOf('/',7)+1));
				switch(type){
					case 'log':
						console.log('DEBUG - %s',data);
					break;
					default:
						console.log('DEBUG(%s) - %s',type,data);
				}
				res.end();
			}else{
				console.log('Serving '+req.url);
				file.serve(req,res);
			}
		}).listen(port,host,2048);
	wss.broadcast = function(data){
		for(var i in sockets){
			sockets[i].send(data);
		}
	};
	wss.on('connection',function(ws){
		console.log('SOCKET OPENED');
		ws.on('message',function(msg){
			console.log('SOCKET DEBUG: %s',msg);
			var data = msg.substr(msg.indexOf(' ')+1),
				i;
			switch(msg.substr(0,msg.indexOf(' '))){
				case 'FINGERPRINT':
					for(i in sockets){
						if(sockets[i].fingerprint == data){
							ws.close(3000,'Already Connected');
						}
						return;
					}
					ws.fingerprint = data;
					sockets.push(ws);
					wss.broadcast('JOIN '+data);
				break;
			}
		});
		ws.on('close',function(){
			if(ws.fingerprint !== undefined){
				wss.broadcast('QUIT '+ws.fingerprint);
			}
			sockets.splice(sockets.indexOf(ws),1);
		});
	});
	return {
		server: server,
		WebSocketServer: wss
	};
};

if(!module.parent){
	exports.start(config.data,config.port,config.host,config['ws-host'],config['ws-port']);
}