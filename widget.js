(function(global,undefined){
	"use strict";
	var types = [],
		loading = [],
		loaded = [];
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
				init: function(config){
					var widget = {},
						i;
					for(i in self){
						if(['init','name','value'].indexOf(i) == -1){
							widget[i] = self[i];
						}
					}
					if(config.children){
						for(i in config.children){
							widget.add(new global.Widget(config.children[i],widget));
						}
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
						widget.extend({
							value: new Prop({
								get: function(){
									return this.record.data[this.name];
								},
								set: function(val){
									this.record.data[this.name] = val;
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
				self,
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
			self = type.init(props);
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
					}
					body.css(self.css).attr(self.attributes).attr({id:id});
					if(props.events !== undefined){
						for(i in props.events){
							body.on(i,props.events[i]);
						}
					}
					if(widgets.length>0){
						for(i in widgets){
							widgets[i].render();
							body.append(widgets[i].body);
						}
					}
					render.call(self);
					return self;
				},
				add: function(widget){
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
				}
			});
			self.render();
			return self;
		},
		widget: new Module({
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
				var promise;
				if(name instanceof Array){
					promise = new widget.RequirePromise(function(resolve,reject){
						widget.require(name.shift())
							.then(function(){
								if(name.length){
									widget.require(name)
										.then(resolve)
										.catch(reject);
								}else{
									resolve();
								}
							})
							.catch(reject);
					});
				}else{
					promise = new widget.RequirePromise(function(resolve,reject){
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
							loading.push(name);
							dom.create('script')
								.attr({
									src: 'lib/juju-mvc/widgets/'+name+'.js'
								})
								.on('load',function(){
									resolve();
								})
								.appendTo('head');
						}else{
							resolve();
						}
					});
				}
				return promise;
			}
		})
	});
})(window);