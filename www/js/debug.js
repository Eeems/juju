global.ready(function(){
	with(global.sandbox.context().context()){
		var socket = new Socket('ws://'+settings.websocket.host+':'+settings.websocket.port);
		extend(global,{
			debug: new Module({
				log: function(message,callback){
					ajax.get('debug/log/'+encodeURIComponent(message),callback);
					return this;
				}
			},'debug'),
		});
		global.debug.log('Client connecting '+global.fingerprint,function(){
			socket.open(function(){
				socket.send('FINGERPRINT '+global.fingerprint);
				socket.timeout = setInterval(function(){
					socket.send('PING '+(+new Date));
				},10000);
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
		});
	}
},[
	'sandbox',
	'ajax',
	'socket'
]);