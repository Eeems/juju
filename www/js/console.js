(function(window,undefined){
	"use strict";
	global.extend(global,{
		console: {
			//TODO - handle debug levels
			log: function(){
				window.console.log.apply(window.console,arguments);
			},
			debug: function(){
				if(global.settings.debug){
					window.console.log.apply(window.console,arguments);
				}
			},
			warn: function(){
				window.console.warn.apply(window.console,arguments);
			},
			error: function(){
				window.console.error.apply(window.console,arguments);
			},
			trace: function(){
				window.console.trace.apply(window.console,arguments);
			}
		}
	});
	global.register('console');
})(window);