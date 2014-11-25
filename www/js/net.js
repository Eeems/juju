global.ready(function(){
	with(global.sandbox.context().context()){
		var socket = new Socket('ws://'+settings.websocket.host+':'+settings.websocket.port);
		extend(global,{
			debug: new Module({
				request: function(type,data){
					if(socket.readyState == WebSocket.OPEN){
						socket.send(type.toUpperCase()+' '+data);
					}else{
						ajax.get('debug/'+encodeURIComponent(type)+'/'+encodeURIComponent(data));
					}
				},
				log: function(message){
					this.request('log',message);
					return this;
				},
				sockets: function(callback){
					ajax.get('debug/sockets/',callback);
					return this;
				},
				_socket: undefined
			},'net'),
		});
		global.debug.log('Client connecting '+global.fingerprint);
		socket.open(function(){
			socket.send('FINGERPRINT '+global.fingerprint);
			socket.send('PAGE '+JSON.stringify(location));
			socket.timeout = setInterval(function(){
				socket.send('PING '+(+new Date));
			},100000);
			global.debug._socket = socket;
		}).close(function(e){
			console.debug('Failed to connect to debug socket: ('+e.code+') '+e.reason);
			clearInterval(socket.timeout);
		}).message(function(e){
			var data = e.data.substr(e.data.indexOf(' ')+1);
				switch(e.data.substr(0,e.data.indexOf(' '))){
					case 'PING':
						socket.send('PONG '+data);
					break;
					case 'PONG':
						console.debug('SOCKET PING '+((+new Date)-parseInt(data))+'ms');
					break;
				}
		}).open();
	}
},[
	'sandbox'
]);