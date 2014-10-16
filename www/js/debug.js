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
			}).close(function(e){
				alert('Failed to connect to debug socket: ('+e.code+') '+e.reason);
			}).open();
		});
	}
},[
	'sandbox',
	'ajax',
	'socket'
]);