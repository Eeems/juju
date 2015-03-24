var Prop = require('./extend.js').Prop,
	ws = require('ws');
exports.SocketServer = function(folder,port,host,ws_host,ws_port){
	var file = new app.Server(folder,{
			gzip: true,
			serverInfo: 'juju/node-static/0.0.1'
		}),
		sockets = [],
		handles = [],
		wss = new ws.Server({
			host: ws_host,
			port: ws_port
		}),
		server = http.createServer(function(req,res){

		}).listen(port,host,2048);
	wss.extend({
		broadcast: function(data){
			for(var i in sockets){
				if(sockets[i].readyState == ws.OPEN){
					sockets[i].send(data);
				}
			}
		}
	});
	this.extend({
		handles: new Prop({
			get: function(){
				return handles;
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
		add: function(name,callback,scope){
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
		run: function(name,data,scope){
			return this.get(name).call(scope,data);
		}
	});
};