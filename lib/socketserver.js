var Prop = require('./extend.js').Prop,
	extend = require('./extend.js').extend,
	ws = require('ws'),
	app = require('node-static'),
	http = require('http');
process.chdir(__dirname+'/..');
exports.SocketServer = function(folder,port,host,ws_host,ws_port){
	var file = new app.Server(folder,{
			gzip: true,
			serverInfo: 'juju/node-static/0.0.1',
			cache: false
		}),
		sockets = [],
		handles = [],
		paths = [],
		wss = new ws.Server({
			host: ws_host,
			port: ws_port
		}),
		server = http.createServer(function(req,res){
			console.log(req.url);
			for(var i=0;i<paths.length;i++){
				var p = paths[i];
				if((p.path instanceof RegExp && req.url.match(p.path))||(req.url == p.path)){
					console.log(i);
					return p.fn(req,res);
				}
			}
			file.serve(req,res);
		}).listen(port,host,2048);
	extend(wss,{
		broadcast: function(data){
			for(var i in sockets){
				if(sockets[i].readyState == ws.OPEN){
					sockets[i].send(data);
				}
			}
		}
	});
	wss.on('connection',function(ws){
		ws.on('message',function(msg){
			this.run(msg.substr(0,msg.indexOf(' ')),msg.substr(msg.indexOf(' ')+1),ws);
		});
		ws.on('close',function(){
			if(ws.fingerprint !== undefined){
				wss.broadcast('QUIT '+ws.fingerprint);
			}
			if(ws.timeout !== undefined){
				clearInterval(ws.timeout);
			}
			sockets.splice(sockets.indexOf(ws),1);
		});
		ws.timeout = setInterval(function(){
			ws.send('PING '+(new Date));
		},100000);
	});
	extend(this,{
		config: new Prop({
			get: function(){
				return {
					folder: folder,
					http: {
						port: port,
						host: host
					},
					websocket: {
						port: ws_port,
						host: ws_host
					}
				}
			}
		}),
		handles: new Prop({
			get: function(){
				return handles;
			}
		}),
		paths: new Prop({
			get: function(){
				return paths;
			}
		}),
		server: new Prop({
			get: function(){
				return server;
			}
		}),
		webSocketServer: new Prop({
			get: function(){
				return wss;
			}
		}),
		sockets: new Prop({
			get: function(){
				return sockets;
			}
		}),
		on: function(name,callback,scope){
			console.info('REGISTER EVENT '+name.toUpperCase());
			handles[name.toUpperCase()] = function(){
				var r = callback.apply(this,arguments);
				return r===undefined?'':r;
			};
			return this;
		},
		get: function(name){
			var f = handles[name.toUpperCase()];
			return f===undefined?function(data){return '';}:f;
		},
		fire: function(name,data,scope){
			return this.get(name).call(scope,data);
		},
		path: function(path,fn){
			console.info('REGISTER PATH '+path);
			paths.push({
				path: path,
				fn: function(){
					var r = fn.apply(this,arguments);
					return r===undefined?'':r;
				}
			});
			return this;
		}
	});
	this.on('fingerprint',function(){
		for(var i in sockets){
			if(sockets[i].fingerprint == data){
				this.close(3000,'Already Connected');
				return;
			}
		}
		this.fingerprint = data;
		wss.broadcast('JOIN '+data);
		sockets.push(this);
	}).on('ping',function(data){
		return 'PONG '+data;
	}).on('pong',function(){
		// TODO - Handle ping
	}).on('log',function(data){
		console.log(data);
	}).on('url',function(data){
		data = JSON.parse(data);
		this.url = data;
	});
	return this;
};