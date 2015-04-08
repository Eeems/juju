(function(global,undefined){
	"use strict";
	var ready = false,
		onready = [];
	global.Prop = function(props){
		for(var i in props){
			this[i] = props[i];
		}
		return this;
	};
	Object.prototype.extend = function(ext){
		var i,o,p,fn = function(name){
			if(o[name]){
				p[name] = o[name];
			}
		};
		for(i in ext){
			o = ext[i];
			if(o instanceof Prop){
				p = {};
				fn('get');
				fn('set');
				fn('value');
				fn('enumerable');
				fn('configurable');
				fn('writable');
				Object.defineProperty(this,i,p);
			}else{
				this[i] = o;
			}
		}
		return this;
	};
	Array.prototype.each = function(fn){
		for(var i=0;i<this.length;i++){
			fn.call(this[i],i);
		}
	};
	global.extend = Object.prototype.extend;
	global.extend({
		global: new Prop({
			get: function(){
				return global;
			}
		}),
		now: new Prop({
			get: function(){
				return performance.now();
			}
		}),
		hash: function(val){
			return (val+'')
				.split('')
				.reduce(function(a,b){
					a=((a<<5)-a)+b.charCodeAt(0);
					return a&a;
				},0);
		},
		settings: {
			debug: true
		},
		flatten: function(arr){
			var out = [],
				i;
			if(arr instanceof Array){
				for(i=0;i<arr.length;i++){
					if(arr[i] !== undefined && arr[i].length !== undefined){
						out = global.flatten(arr[i]);
					}else{
						out.push(arr[i]);
					}
				}
			}else{
				out.push(arr);
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
					})(),
					location.href

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
					if(out === null){
						out = 0;
					}
					return out.toString(16);
				};
			keys.forEach(function(v,i,a){
				a[i] = hex(v);
			});
			return keys.join('-');
		},
		ready: function(fn){
			if(fn && !(fn instanceof Event)){
				onready.push(fn);
			}else{
				ready = true;
			}
			if(ready){
				while((fn = onready.shift())){
					try{
						fn.call(global);
					}catch(e){
						console.error(e);
					}
				}
			}
		},
		Module: function(obj){
			this.extend(obj);
			return this;
		}
	});
	if(global instanceof Window){
		global.addEventListener('load',global.ready);
	}else{
		global.ready();
	}
})(window);