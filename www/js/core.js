(function(){
	"use strict";
	var onready = [],
		req = new XMLHttpRequest(),
		startfn = function(){};
	function Module(obj,name){
		for(var i in obj){
			try{
				this[i] = obj[i];
			}catch(e){
				console.error(e);
			}
		}
		if(name !== undefined){
			try{
				global.register(name);
			}catch(e){}
		}else{
			name = ''+now();
		}
		this._name = name;
		return this;
	}
	function now(){
		return +new Date;
	}
	function hash(val){
		return val.split("").reduce(function(a,b){
			a=((a<<5)-a)+b.charCodeAt(0);
			return a&a;
		},0);
	}
	window.Module = Module;
	window.global = new Module({
		settings: {	// default initializing settings
			debug: true
		},
		version: 'git-'+now(),
		start: function(callback){
			if(callback === undefined){
				console.debug('EVENT - start');
				startfn.call(this);
				global.ready();
			}else{
				startfn = callback;
			}
		},
		now: now,
		register: function(name){
			if(global._modules.indexOf(name) == -1){
				console.debug('EVENT - MODULE REGISTERED '+name);
				global._modules.push(name);
			}
		},
		hash: hash,
		ready: function(callback,depends){
			if(arguments.length > 0){
				var hash = global.hash(callback+'');
				console.debug('READY SCRIPT - ADD '+hash);
				onready.push({
					fn: callback,
					deps: depends===undefined?[]:depends,
					name: hash
				});
			}else{
				var i,
					count,
					deps,
					fn = function(){
						if(onready.length > 0){
							count=0;
							deps = onready[0].deps;
							for(i=0;i<deps.length;i++){
								if(global._modules.indexOf(deps[i]) != -1){
									count++;
								}
							}
							if(count == deps.length){
								var script = onready.shift();
								console.debug('READY SCRIPT - RUN '+script.name);
								script.fn.apply(this);
							}else{
								onready.push(onready.shift());
							}
							setTimeout(fn,1);
						}
					};
				fn();
			}
		},
		onready: function(){
			return onready;
		},
		extend: function(original,extra){
			for(var i in extra){
				try{
					original[i] = extra[i];
				}catch(e){}
			}
			return original;
		},
		flatten: function(arr){
			var out = [],
				i;
			for(i=0;i<arr.length;i++){
				if(arr[i] !== undefined && arr[i].length !== undefined){
					out = global.flatten(arr[i]);
				}else{
					out.push(arr[i]);
				}
			}
			return out;
		},
		fingerprint: function(){
			var keys = [
					navigator.userAgent,
					navigator.language,
					screen.colorDepth,
					screen.width+'x'+screen.height,
					new Date().getTimezoneOffset(),
					(function(){
						return typeof window.sessionStorage != 'undefined';
					})(),
					(function(){
						return typeof window.localStorage != 'undefined';
					})(),
					!!window.indexDB,
					typeof(document.body.addBehavior),
					typeof(window.openDatabase),
					navigator.cpuClass,
					navigator.platform,
					navigator.doNotTrack,
					(function(){
						var ret = [],
							i,
							v;
						for(i=0;i<navigator.plugins.length;i++){
							v = navigator.plugins[i];
							ret.push((function(v){
								var ret = [],
									i,
									m;
								for(i=0;i<v.length;i++){
									m = v[i];
									ret.push(
										[
											m.type,
											m.suffixes
										].join('~')
									);
								}
								return [
									v.name,
									v.description,
									ret.join(',')
								].join('::');
							})(v));
						}
						return ret.join(';');
					})()

				],
				hex = function(input){
					var i,
						out = 0;
					switch(typeof input){
						case 'string':
							out = hash(input);
						break;
						case 'undefined':break;
						case 'boolean':
							out = input?1:0;
						break;
						default:
							out = input;
					}
					return out.toString(16);
				};
			keys.forEach(function(v,i,a){
				a[i] = hex(v);
			});
			return keys.join('-');
		},
		_scripts: [],
		_modules: [],
		Module: Module
	},'global');
	// Load settings
	req.onload = function(){
		global.settings = req.response;
		global.fingerprint = global.fingerprint();
		global.ready();
	};
	req.open('GET','etc/settings.json',true);
	req.responseType = 'json';
	req.send();
})();