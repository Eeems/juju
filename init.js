(function(global,undefined){
	"use strict";
	var inc = function(path,onload){
		var script = document.createElement('script');
		script.src = path;
		script.onload = onload;
		document.head.appendChild(script);
	};
	inc('lib/core.js',function(){
		inc('lib/fetch.js',function(){
			fetch('app.json')
				.then(function(res){
					return res.json();
				})
				.then(function(json){
					global.settings = json;
					require([
						'lib/dom.js',
						'lib/canvas.js',
						'lib/keyboard.js',
						'lib/mouse.js',
						'lib/page.js',
						'lib/socket.js',
						'lib/db.js',
						'lib/cookie.js',
						'lib/widget.js',
						'app.js'
					]).then(function(){
						if(global instanceof Window && document.readyState != 'complete'){
							global.addEventListener('load',global.ready);
						}else{
							global.ready();
						}
					})
					.catch(function(e){
						console.error(e);
					});
				});
		});
	})
})(window);