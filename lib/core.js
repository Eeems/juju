(function(global,undefined){
	"use strict";
	var ready = false,
		onready = [],
		storage = localStorage || sessionStorage || {
			store: {},
			getItem: function(name){
				return store[name];
			},
			setItem: function(name,value){
				store[name] = value;
			}
		};
	global.Prop = function(props){
		for(var i in props){
			this[i] = props[i];
		}
		return this;
	};
	Object.defineProperty(Object.prototype,'extend',{
		enumerable: false,
		value: function(ext){
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
		}
	});
	Object.defineProperty(Array.prototype,'each',{
		enumerable: false,
		value: function(fn){
			for(var i=0;i<this.length;i++){
				fn.call(this[i],i);
			}
		}
	});
	Object.defineProperty(Array.prototype,'diff',{
		enumerable: false,
		value: function(a){
			return this.filter(function(i){
				return a.indexOf(i) < 0;
			});
		}
	});
	Object.defineProperty(Array.prototype,'insert',{
		enumerable: false,
		value: function(id,value){
			this.splice(id,0,value);
		}
	});
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
		settings: new Proxy(JSON.parse(storage.getItem('settings')) || {
			debug: false,
			log: {
				ready: false
			}
		},{
			get: function(settings, name, receiver){
				var proxy = function(obj){
					return typeof obj != "object" ? obj : new Proxy(obj,{
						get: function(t,n,r){
							return proxy(t[n]);
						},
						set: function(t,n,v,r){
							t[n] = v;
							storage.setItem('settings',JSON.stringify(settings));
							return true;
						},
						has: function(t,n){
							return n in t;
						},
						deleteProperty: function(t,n){
							var o = {};
							for(var i in t){
								if(i != n){
									o[i] = t[i];
								}
							}
							t = o;
							storage.setItem('settings',JSON.stringify(settings));
							return true;
						}
					});
				};
				return proxy(settings[name]);
			},
			set: function(settings, name, value, receiver){
				settings[name] = value;
				storage.setItem('settings',JSON.stringify(settings));
				return true;
			},
			has: function(settings,name){
				return name in settings;
			},
			deleteProperty: function(settings,name){
				settings[name] = undefined;
				var s = {};
				for(var i in settings){
					if(i != name){
						s[i] = settings[i];
					}
				}
				settings = s;
				storage.setItem('settings',JSON.stringify(settings));
				return true;
			}
		}),
		flatten: function(arr){
			var out = [],
				i;
			if(arr instanceof Array){
				arr.forEach(function(el,i){
					if(el && el.length !== undefined){
						out = global.flatten(el);
					}else{
						out.push(el);
					}
				});
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
				if("ready" in global.settings.log){
					console.info('READY()');
					console.time('Ready');
				}
				while((fn = onready.shift())){
					try{
						fn.call(global);
					}catch(e){
						console.error(e);
					}
				}
				if("ready" in global.settings.log){
					console.timeEnd('Ready');
				}
			}
		},
		Module: function(obj){
			this.extend(obj);
			return this;
		}
	});
})(window);