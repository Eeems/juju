(function(global,undefined){
	"use strict";
	var views = {},
		loading = [],
		loaded = [];
	if(!global.settings || !global.settings.view){
		global.settings.view = {
			log: {
				require: false
			}
		};
	}
	global.extend({
		View: function(name,config){
			if(views[name]){
				throw new Error('View already exists.');
			}
			if(!config.render){
				throw new Error('Configuration mising: render');
			}
			var parent,
				open = false,
				body,
				self = this.extend({
					name: name,
					parent: new Prop({
						get: function(){
							return parent;
						},
						set: function(selector){
							if(parent != selector){
								this.close()
									.open(selector);
							}
						}
					}),
					isOpen: new Prop({
						get: function(){
							return open;
						}
					}),
					open: function(selector){
						parent = selector || parent || dom.body;
						for(var i in views){
							views[i].isOpen && views[i].close();
						};
						open = true;
						body = config.render();
						dom.get(parent).children = body;
						config.open && config.open(this);
						return this;
					},
					close: function(){
						config.close && config.close(this);
						dom.get(parent).drop('*');
						open = false;
						return this;
					},
					find: function(selector){
						var body = onrender();
						return body instanceof Widget?body.find(selector):[];
					},
					body: new Prop({
						readonly: true,
						value: body
					})
				});
			views[name] = self;
			return self;
		},
		views: new Prop({
			get: function(){
				return views;
			}
		}),
		view: new Module({
			RequirePromise: function(fn){
				var p = new Promise(fn);
				p.extend({
					and: function(name){
						return new view.RequirePromise(function(resolve,reject){
							view.require(name).then(function(){
									resolve();
								})
								.catch(reject);
						});
					}
				});
				return p;
			},
			require: function(name){
				var promise,
					load = function(name){
						if(global.settings.view.log.require){
							console.info('WIDGET.REQUIRE('+name+')');
						}
						return new Promise(function(resolve,reject){
							if(loading.indexOf(name)!=-1){
								var fn = function(){
									if(views[name]){
										resolve();
									}else{
										setTimeout(fn,1);
									}
								};
								fn();
							}else if(loaded.indexOf(name)==-1){
								if(global.settings.view.log.require){
									console.info('WIDGET.REQUIRE('+name+')');
								}
								loading.push(name);
								require('lib/views/'+name+'.js')
									.then(function(){
										loading.splice(loading.indexOf(name),1);
										loaded.push(name);
										resolve();
									})
									.catch(reject);
							}else{
								resolve();
							}
						});
					};
				if(name instanceof Array){
					var todo = name.length;
					promise = new view.RequirePromise(function(resolve,reject){
						name.forEach(function(name,i){
							load(name)
								.then(function(){
									todo--;
									if(!todo){
										resolve();
									}
								})
								.catch(reject);
						});
					});
				}else{
					promise = load(name);
				}
				return promise;
			}
		})
	});
})(window);