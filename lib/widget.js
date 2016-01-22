(function(global,undefined){
	"use strict";
	var types = [],
		loading = [],
		loaded = [];
	if(!global.settings || !global.settings.widget){
		global.settings.widget = {
			log: {
				require: false
			}
		};
	}
	global.extend({
		WidgetType: function(props){
			if(props.name === undefined){
				throw new Error('Widget types require a name');
			}
			if(global.widget.type(props.name)){
				throw new Error('Wiget type by that name already exists');
			}
			if(props.init === undefined){
				throw new Error('Widget types require an init function');
			}
			var self = this,
				i;
			self.tagName = 'div';
			for(i in props){
				self[i] = props[i];
			}
			self.extend({
				init: function(config,widget,children){
					var i;
					for(i in self){
						if(['init','name','value'].indexOf(i) == -1){
							widget[i] = self[i];
						}
					}
					if(config.children){
						config.children.forEach(function(child){
							if(!(child instanceof Widget)){
								child = new Widget(child);
							}
							child.parent = widget;
							children.push(child);
						});
					}
					props.init.call(widget,config);
					widget.css = config.css===undefined?{}:config.css;
					widget.attributes = config.attributes===undefined?{}:config.attributes;
					if(props.events !== undefined){
						for(i in props.events){
							widget.on(i,props.events[i]);
						}
					}
					if(props.value){
						var value;
						widget.extend({
							value: new Prop({
								get: function(){
									return value;
								},
								set: function(val){
									value = val;
									try{
										return props.value.apply(this,arguments);
									}catch(e){}
								}
							})
						});
					}
					return widget;
				}
			});
			types.push(self);
			if(loading.indexOf(props.name)!=-1){
				loading.splice(loading.indexOf(props.name),1);
			}
			if(loaded.indexOf(props.name)==-1){
				loaded.push(props.name);
			}
			return self;
		},
		Widget: function(props,parent){
			var type,
				self = this,
				id,
				render = function(){},
				widgets = [],
				i,
				body,
				ret = function(val){
					return val instanceof Nodes?self:val;
				};
			if(props.type === undefined){
				throw new Error('No type specified for this widget');
			}
			type = global.widget.type(props.type);
			if(!type){
				throw new Error('The '+props.type+' widget type does not exist');
			}
			id = type.name+'-'+(+new Date);
			self = type.init(props,self,widgets);
			if(self.render!==undefined){
				render = self.render;
			}
			self.extend({
				id: new Prop({
					readonly: true,
					value: id
				}),
				body: new Prop({
					get: function(){
						return body;
					}
				}),
				children: new Prop({
					get:function(){
						return widgets;
					}
				}),
				type: new Prop({
					get: function(){
						return props.type;
					}
				}),
				name: new Prop({
					get: function(){
						if(props.name){
							return props.name;
						}
					}
				}),
				parent: new Prop({
					get: function(){
						return parent;
					},
					set: function(widget){
						parent = widget;
					}
				}),
				on: function(){
					return ret(this.body.on.apply(this.body,arguments));
				},
				fire: function(){
					return ret(this.body.fire.apply(this.body,arguments));
				},
				height: function(){
					return ret(this.body.height.apply(this.body,arguments));
				},
				width: function(){
					return ret(this.body.width.apply(this.body,arguments));
				},
				render: function(){
					var i,value;
					if(body){
						body.drop('*').off();
					}else{
						body = dom.create(this.tagName);
						body.widget = this;
					}
					body.css(self.css).attr(self.attributes).attr({id:id});
					if(props.events !== undefined){
						for(i in props.events){
							body.on(i,props.events[i]);
						}
					}
					if(widgets.length>0){
						widgets.forEach(function(widget){
							widget.render();
							body.append(widget.body);
						});
					}
					render.call(self);
					return self;
				},
				add: function(widget){
					if(!(widget instanceof Widget)){
						widget = new Widget(widget);
					}
					widget.parent = self;
					widgets.push(widget);
					self.render();
					return self;
				},
				remove: function(widget){
					for(var i in widgets){
						if(widgets[i] === widget){
							widgets.splice(i,1);
						}
					}
					self.render();
					return self;
				},
				empty: function(){
					widgets = [];
					self.render();
					return self;
				},
				find: function(selector){
					var filters = {
							types:[],
							classes:[],
							ids:[],
							attrs:[]
						},
						filter = function(arr,val){
							return !arr.length || arr.indexOf(val)!=-1
						},
						fn = function(parent){
							var ret = [];
							parent.children.forEach(function(widget){
								var f = true;
								if(
									filter(filters.ids,widget.id) &&
									filter(filters.types,widget.type)
								){
									if(filters.attrs.length){
										filters.attrs.forEach(function(attr){
											console.log(attr);
											if(f){
												f = widget.attributes[attr[0]] == attr[1];
											}
										});
									}
									if(filters.classes.length){
										f = f &&
											widget.attributes
												.className &&
											!widget.attributes
												.className
												.split(' ')
												.diff(filters.classes).length;
									}
									f && ret.push(widget);
								}
								ret = ret.concat(fn(widget));
							});
							return ret;
						};
					selector.split(/(?=\.)|(?=#)|(?=\[)/).forEach(function(token){
						switch (token[0]) {
							case '#':
								filters.ids.push(token.slice(1));
							break;
							case '.':
								filters.classes.push(token.slice(1));
							break;
							case '[':
								filters.attrs.push(token.slice(1,-1).split('='));
							break;
							default :
								filters.types.push(token);
						}
					});
					return fn(this);
				}
			});
			self.render();
			return self;
		},
		widget: new Module({
			"new": new Proxy(function(){}, {
				apply: function(target, thisArg, argumentsList){
					return new Widget(argumentsList[0],undefined);
				},
				get: function(target, name, receiver){
					return function(props){
						props = props || {};
						props.type = name;
						return widget.new(props);
					}
				}
			}),
			types: new Prop({
				get: function(){
					return types;
				}
			}),
			type: function(name){
				var r = false;
				types.each(function(i){
					if(types[i].name == name){
						r = types[i];
					}
				});
				return r;
			},
			RequirePromise: function(fn){
				var p = new Promise(fn);
				p.extend({
					and: function(name){
						return new widget.RequirePromise(function(resolve,reject){
							widget.require(name).then(function(){
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
						if(global.settings.widget.log.require){
							console.info('WIDGET.REQUIRE('+name+')');
						}
						return new Promise(function(resolve,reject){
							if(loading.indexOf(name)!=-1){
								var fn = function(){
									if(widget.type(name)){
										resolve();
									}else{
										setTimeout(fn,1);
									}
								};
								fn();
							}else if(loaded.indexOf(name)==-1){
								if(global.settings.widget.log.require){
									console.info('WIDGET.REQUIRE('+name+')');
								}
								loading.push(name);
								require('lib/widgets/'+name+'.js')
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
					promise = new widget.RequirePromise(function(resolve,reject){
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