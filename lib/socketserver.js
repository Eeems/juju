var Prop = require('./extend.js').Prop,
	extend = require('./extend.js').extend,
	ws = require('ws'),
	app = require('node-static'),
	http = require('http');
process.chdir(__dirname+'/..');
exports.SocketServer = function(folder,port,host,ws_host,ws_port){
	var file = new app.Server(folder,{
			gzip: true,
			serverInfo: 'juju/node-static/0.0.1'
		}),
		sockets = [],
		handles = [],
		paths = [],
		wss = new ws.Server({
			host: ws_host,
			port: ws_port
		}),
		server = http.createServer(function(req,res){
			if(paths[req.url]){
				paths[req.url](req,res);
			}else{
				file.serve(req,res);
			}
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
			handles[path] = function(){
				var r = fn.apply(this,arguments);
				return r===undefined?'':r;
			};
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