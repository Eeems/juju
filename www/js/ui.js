(function(global,undefined){
	var uis = [],
		UserInterface = function(name,parent){
			// Make sure that we are using a Nodes object
			parent = parent instanceof Nodes?parent:dom.get(parent);
			// Mouse handler. Or reuse if global
			var cvs = canvas.get(name),
				mouse = new Mouse(cvs);
			parent.append(cvs).css({
				overflow: 'hidden',
				padding: 0,
				margin: 0
			}).on('resize',function(e){
				cvs.width = parent.width();
				cvs.height = parent.height();
			}).fire('resize');
			this.extend({
				mouse: new Prop({
					get: function(){
						return mouse;
					}
				}),
				parent: new Prop({
					get: function(){
						return parent;
					}
				}),
				canvas: new Prop({
					get: function(){
						return cvs;
					}
				}),
				draw: function(){
					this.canvas.draw();
					return this;
				},
				'delete': function(){
					try{
						cvs.remove();
					}catch(e){}
					mouse = undefined;
					cvs = undefined;
					parent = undefined;
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
			uis.push(this);
			return this;
		},
		draw = function(){
			for(var i=0;i<uis.length;i++){
				try{
					uis[i].draw();
				}catch(e){}
			}
			global.requestAnimationFrame(draw);
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
		})
	});
	global.ready(function(){
		global.extend({
			ui: new UserInterface('main',dom.body)
		}).on('resize',function(){
			dom.body
				.width(viewport.width)
				.height(viewport.height)
				.fire('resize');
		});
		setTimeout(function(){
			global.fire('resize');
		},1);
	});
	draw();
})(window);