(function(global,undefined){
	"use strict";
	var inc = function(path,onload){
			console.info('INC('+path+')');
			var script = document.createElement('script');
			script.src = path;
			script.onload = onload;
			document.head.appendChild(script);
		};
	console.group('Startup');
	console.time('Startup');
	console.group('Inc');
	console.time('Inc');
	inc('lib/core.js',function(){
		var version = global.settings.version;
		inc('lib/fetch.js',function(){
			console.timeEnd('Inc');
			console.groupEnd();
			console.group('Init');
			console.time('Init');
			fetch('app.json')
				.then(function(res){
					console.info('INIT(app.json)');
					return res.json();
				})
				.then(function(json){
					for(var i in json.settings){
						global.settings[i] = json.settings[i];
					}
					json.include = json.include || [];
					json.include.push(json.init || 'app.js');
					console.group('Require');
					console.group('Require.include');
					console.time('Require.include');
					return require(json.include,version!=global.settings.version)
						.then(function(){
							console.timeEnd('Require.include');
							console.groupEnd();
							console.group('Require.widget');
							console.time('Require.widget');
							return widget.require(json.widgets);
						})
						.then(function(){
							console.timeEnd('Require.widget');
							console.groupEnd();
							console.group('Require.view');
							console.time('Require.view');
							return view.require(json.views);
						});
				})
				.then(function(){
					console.timeEnd('Require.view');
					console.groupEnd();
					console.groupEnd();
					console.timeEnd('Init');
					console.groupEnd();
					if(global instanceof Window && document.readyState != 'complete'){
						global.addEventListener('load',global.ready);
					}else{
						global.ready();
					}
					console.timeEnd('Startup');
					console.groupEnd();
				})
				.catch(function(e){
					console.error(e);
					console.timeEnd('Startup');
					console.groupEnd();
				});
		});
	})
})(window);