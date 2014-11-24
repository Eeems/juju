var fs = require('fs'),
	app = require('node-static'),
	http = require('http'),
	ws = require('ws'),
	config = require('../etc/server.json');
process.chdir(__dirname+'/..');
console.log('Running from context %s',process.cwd());
exports.handle = global.handle = {
	_handles: [],
	add: function(name,callback,scope){
		this._handles[name.toUpperCase()] = function(){
			var r = callback.apply(this,arguments);
			return r === undefined?'':r;
		};
		return this;
	},
	get: function(name){
		var f = this._handles[name.toUpperCase()];
		return f===undefined?function(data){
			console.log('DEBUG(%s) - %s',name,data);
			return '';
		}:f;
	},
	run: function(name,data,scope){
		return this.get(name).call(scope,data);
	}
};
exports.sockets = global.sockets = sockets = [];
exports.start = function(folder,port,host,ws_host,ws_port){
	console.log('Starting server for %s on %s:%d',folder,host,port);
	console.log('Starting websocket server on %s:%d',ws_host,ws_port);
	var file = new app.Server(folder,{
			gzip: true,
			serverInfo: 'juju/node-static/0.0.1'
		}),
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
				res.write(handle.run(type,data,res));
				res.end();
			}else{
				console.log('Serving '+req.url);
				file.serve(req,res);
			}
		}).listen(port,host,2048);
	wss.broadcast = function(data){
		for(var i in sockets){
			if(sockets[i].readyState == ws.OPEN){
				sockets[i].send(data);
			}
		}
	};
	wss.on('connection',function(ws){
		console.log('SOCKET OPENED');
		ws.on('message',function(msg){
			console.log('SOCKET DEBUG: %s',msg);
			var data = msg.substr(msg.indexOf(' ')+1),
				i;
			handle.run(msg.substr(0,msg.indexOf(' ')),data,ws);
		});
		ws.on('close',function(){
			if(ws.fingerprint !== undefined){
				console.log('SOCKET CLOSED '+ws.fingerprint);
				wss.broadcast('QUIT '+ws.fingerprint);
			}else{
				console.log('SOCKET CLOSED');
			}
			if(ws.timeout !== undefined){
				clearInterval(ws.timeout);
			}
			sockets.splice(sockets.indexOf(ws),1);
		});
		ws.timeout = setInterval(function(){
			ws.send('PING '+(+new Date));
		},100000);
		console.log('SOCKET CONNECTION COUNT: '+sockets.length);
	});
	handle.add('fingerprint',function(data){
			for(i in sockets){
				if(sockets[i].fingerprint == data){
					this.close(3000,'Already Connected');
				}
				return;
			}
			this.fingerprint = data;
			sockets.push(this);
			wss.broadcast('JOIN '+data);
		})
		.add('ping',function(data){
			return 'PONG '+data;
		})
		.add('pong',function(data){
			console.log('SOCKET PING - %s - %dms',ws.fingerprint,((+new Date)-parseInt(data)));
		})
		.add('log',function(data){
			console.log('DEBUG - %s',data);
		})
		.add('sockets',function(data){
			var s = [],
				i;
			for(i in sockets){
				s.push(sockets[i].fingerprint);
			}
			return JSON.stringify(s);
		});
	return {
		server: server,
		WebSocketServer: wss
	};
};

if(!module.parent){
	global.ws = exports.start(config.data,config.port,config.host,config['ws-host'],config['ws-port']);
	require('repl').start({
		useGlobal: true
	});
}