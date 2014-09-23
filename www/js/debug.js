global.ready(function(){
	with(global.sandbox.context().context()){
		extend(global,{
			debug: new Module({
				log: function(message,callback){
					ajax.get('debug/log/'+encodeURIComponent(message),callback);
					return this;
				}
			},'debug')
		});
		global.debug.log('Client connecting '+global.fingerprint);
	}
},[
	'console',
	'sandbox',
	'ajax'
]);