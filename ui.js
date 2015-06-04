(function(global,undefined){
	"use strict";
	var uis = [],
		fps = 0,
		lasttime = now,
		resize = true,
		UserInterface = function(name,parent){
			// Make sure that we are using a Nodes object
			parent = parent instanceof Nodes?parent:dom.get(parent);
			// Mouse handler. Or reuse if global
			var self = this,
				mouse = new Mouse(parent),
				header = widget.new({type:'header'}),
				nav = widget.new({type:'nav'}),
				body = widget.new({type:'body'}),
				footer = widget.new({type:'footer'}),
				events = {
					resize: []
				};
			parent.append(header.body)
				.append(nav.body)
				.append(body.body)
				.append(footer.body)
				.css({
					overflow: 'hidden',
					padding: 0,
					margin: 0
				})
				.on('resize',function(e){
					for(var i in events.resize){
						events.resize[i].call(self,e);
					}
					body.height(
						parent.height() - header.height() - nav.height() - footer.height()
					);
				})
				.fire('resize');
			self.extend({
				mouse: new Prop({
					get: function(){
						return mouse;
					}
				}),
				header: new Prop({
					get: function(){
						return header;
					}
				}),
				nav: new Prop({
					get: function(){
						return nav;
					}
				}),
				body: new Prop({
					get: function(){
						return body;
					}
				}),
				reset: function(){
					header.body.remove();
					nav.body.remove();
					body.body.remove();
					footer.body.remove();
					header = widget.new({type:'header'});
					nav = widget.new({type:'nav'});
					body = widget.new({type:'body'});
					footer = widget.new({type:'footer'});
					parent.append(header.body)
						.append(nav.body)
						.append(body.body)
						.append(footer.body);
					parent.off();
					self.render();
					return self;
				},
				empty: function(){
					header.empty();
					nav.empty();
					body.empty();
					footer.empty();
					self.render();
					return self;
				},
				footer: new Prop({
					get: function(){
						return footer;
					}
				}),
				resize: function(fn){
					if(fn instanceof Function){
						events.resize.push(fn);
					}else{
						parent.fire('resize');
					}
					return self;
				},
				off: function(){
					events.resize = [];
					return self;
				},
				parent: new Prop({
					get: function(){
						return parent;
					}
				}),
				render: function(){
					header.render();
					nav.render();
					body.render();
					footer.render();
					self.resize();
					return self;
				},
				'delete': function(){
					mouse = undefined;
					parent = undefined;
					self = undefined;
					for(var i in this){
						try{
							delete this[i];
						}catch(e){}
					}
					for(i=0;i<uis.length;i++){
						if(uis[i]===this){
							uis.splice(i);
						}
					}
				}
			});
			uis.push(self);
			self.render();
			return self;
		},
		frame = function(){
			var time = now;
			fps = (1000/(time - lasttime)).toFixed(2);
			lasttime = time;
			if(page.visible){
				if(resize){
					global.fire('optimizedResize');
				}
			}
			global.requestAnimationFrame(frame);
		};
	global.extend({
		UserInterface: function(parent){
			return new UserInterface(parent);
		},
		viewport: new Module({
			width: new Prop({
				get: function(){
					return global.innerWidth;
				}
			}),
			height: new Prop({
				get: function(){
					return global.innerHeight;
				}
			})
		}),
		fps: new Prop({
			get: function(){
				return fps;
			}
		})
	});
	global.ready(function(){
		global.extend({
			ui: new UserInterface('main',dom.body)
		}).on('resize',function(){
			resize = true;
		}).on('optimizedResize',function(){
			dom.body
				.width(viewport.width)
				.height(viewport.height)
				.fire('resize');
			resize = false;
		});
		frame();
	});
})(window);