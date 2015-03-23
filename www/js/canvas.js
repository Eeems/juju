(function(global,undefined){
	var layers = [],
		font;
	global.extend({
		Shape: function(attributes){
			var i,a,parent;
			this.extend({
				id: new Prop({
					get: function(){
						if(parent){
							for(var i=0;i<parent.children.length;i++){
								if(parent.children[i]===this){
									return i;
								}
							}
						}
					}
				}),
				parent: new Prop({
					get: function(){
						return parent;
					},
					set: function(val){
						this.remove();
						val.append(this,true);
						parent = val;
					}
				}),
				type: 'rectangle',
				width: undefined,
				height: undefined,
				colour: 'black',
				draw: 'fill',
				x: 0,
				y: 0,
				text: '',
				remove: function(){
					if(parent){
						parent.drop(this.id);
					}
				},
				'delete': function(){
					this.remove();
					for(var i in this){
						try{
							delete this[i];
						}catch(e){}
					}
					parent = undefined;
				}
			});
			for(i in attributes){
				a = attributes[i];
				switch(i){
					case 'color':case 'colour':
						this.colour = a;
					break;
					case 'draw':
						if(a != 'fill' || a != 'stroke'){
							break;
						}
					case 'width':case 'height':case 'type':
					case 'x':case 'y':case 'text':
						this[i] = a;
					break;
				}
			}
			return this;
		},
		Group: function(name){
			var children = [],
				parent;
			this.extend({
				id: new Prop({
					get: function(){
						if(parent){
							for(var i=0;i<parent.children.length;i++){
								if(parent.children[i]===this){
									return i;
								}
							}
						}
					}
				}),
				name: new Prop({
					get: function(){
						return name;
					}
				}),
				parent: new Prop({
					get: function(){
						return parent;
					},
					set: function(val){
						this.remove();
						val.append(this,true);
						parent = val;
					}
				}),
				children: new Prop({
					get: function(){
						return children;
					}
				}),
				each: function(fn){
					for(var i =0;i<children.length;i++){
						if(children[i]!==undefined){
							fn.call(children[i],i);
						}
					}
				},
				shape: function(attributes){
					return this.append(global.canvas.shape(attributes));
				},
				group: function(name){
					var g;
					this.each(function(){
						if(this.name === name){
							g = this;
						}
					});
					if(!g){
						g = global.canvas.group(name);
						this.append(g);
					}
					return g;
				},
				draw: function(){
					var p = this;
					while((p=p.parent) instanceof Group){}
					p.draw();
					return this;
				},
				append: function(child,force){
					if(!(child instanceof Shape || child instanceof Group)){
						child = global.canvas.create(child);
					}
					if(!force){
						child.parent = this;
					}else if(children.indexOf()==-1){
						children.push(child);
					}
					return this;
				},
				drop: function(id){
					children.slice(id,1);
					return this;
				},
				remove: function(){
					if(parent){
						parent.drop(this.id);
					}
				},
				'delete': function(){
					this.remove();
					while(children.length){
						children[0].delete();
					}
					for(var i in this){
						try{
							delete this[i];
						}catch(e){}
					}
					parent = undefined;
				}
			});
			return this;
		},
		Canvas: function(name){
			var node = dom.create('canvas').attr({id:'canvas_'+now,name:'canvas_'+name}),
				context = node[0].getContext('2d'),
				children = [];
			this.extend({
				id: new Prop({
					get: function(){
						return node[0].id;
					},
					set: function(val){
						node.attr({id:val});
					}
				}),
				name: new Prop({
					get: function(){
						return name;
					},
					set: function(val){
						name = val;
						node.attr({name:'canvas_'+name});
					}
				}),
				node: new Prop({
					get: function(){
						return node;
					}
				}),
				context: new Prop({
					get: function(){
						return context;
					}
				}),
				each: function(fn){
					for(var i =0;i<children.length;i++){
						if(children[i]!==undefined){
							fn.call(children[i],i);
						}
					}
				},
				font: new Prop({
					get: function(){
						return context.font;
					},
					set: function(val){
						context.font = val;
					}
				}),
				baseline: new Prop({
					get: function(){
						return context.textBaseline;
					},
					set: function(val){
						context.textBaseline = val;
					}
				}),
				align: new Prop({
					get: function(){
						return context.textAlign;
					},
					set: function(val){
						context.textAlign = val;
					}
				}),
				style: function(style){
					for(var i in style){
						try{
							if(context[i]!==undefined){
								context[i] = style[i];
							}
						}catch(e){
							console.warn(e);
						}
					}
					return this;
				},
				stroke: function(){
					context.stroke();
					return this;
				},
				fill: function(){
					context.fill();
					return this;
				},
				width: new Prop({
					get: function(){
						return node.width();
					},
					set: function(val){
						node.width(val);
					}
				}),
				height: new Prop({
					get: function(){
						return node.height();
					},
					set: function(val){
						node.height(val);
					}
				}),
				text: function(text,x,y,w){
					context.fillText(text,x,y,w);
					return this;
				},
				rect: function(x,y,w,h){
					x = x|0;
					y = y|0;
					w = w===undefined?this.width():w;
					h = h===undefined?this.height():h;
					context.rect(x,y,w,h);
					return this;
				},
				fillRect: function(x,y,w,h){
					x = x|0;
					y = y|0;
					w = w===undefined?this.width():w;
					h = h===undefined?this.height():h;
					context.fillRect(x,y,w,h);
					return this;
				},
				strokeRect: function(x,y,w,h){
					x = x|0;
					y = y|0;
					w = w===undefined?this.width():w;
					h = h===undefined?this.height():h;
					context.strokeRect(x,y,w,h);
					return this;
				},
				clear: function(x,y,w,h){
					x = x|0;
					y = y|0;
					w = w===undefined?this.width():w;
					h = h===undefined?this.height():h;
					context.clearRect(x,y,w,h);
					return this;
				},
				measureText: function(){
					return context.measureText.apply(context,arguments);
				},
				sprite: function(img,x,y,w,h){
					x = x|0;
					y = y|0;
					if(typeof img == 'string'){
						var layer = this;
						img = dom.create('img').attr({
							src: img+'?v='+version
						}).on('load',function(){
							layer.sprite(this,x,y,w,h);
						});
					}else{
						img = img instanceof Nodes?img[0]:img;
						w = w===undefined?img.width:w;
						h = h===undefined?img.height:h;
						context.drawImage(img,x,y,w,h);
					}
					return this;
				},
				children: new Prop({
					get: function(){
						return children;
					}
				}),
				append: function(child,force){
					if(!(child instanceof Shape || child instanceof Group)){
						child = global.canvas.create(child);
					}
					if(!force){
						child.parent = this;
					}else if(children.indexOf()==-1){
						children.push(child);
					}
					return this;
				},
				drop: function(id){
					children.splice(id,1);
					return this;
				},
				draw: function(){
					var self = this,
						draw = function(stack){
						var i,c;
						for(i=0;i<stack.length;i++){
							c = stack[i];
							if(c instanceof Shape){
								switch(c.type){
									case 'sprite':
										self.sprite(c.sprite,c.x,c.y,c.width,c.height);
									break;
									case 'text':
										if(c.draw == 'fill'){
											self.style({
												fillStyle: c.colour
											}).text(c.text,c.x,c.y,c.width);
										}else{
											self.style({
												strokeStyle: c.colour
											});
											self.context.strokeText(c.text,c.x,c.y.c.width);
										}
									break;
									default:
										self.rect(c.x,c.y,c.width,c.height);
										if(c.draw == 'fill'){
											self.style({
												fillStyle: c.colour
											}).fill();
										}else{
											self.style({
												strokeStyle: c.colour
											}).stroke();
										}
								}
							}else{
								draw(c.children);
							}
						}
					};
					draw(children);
					return this;
				},
				remove: function(){
					node.remove();
					return this;
				},
				appendTo: function(p){
					node.appendTo(p);
					return this;
				},
				shape: function(attributes){
					return this.append(global.canvas.shape(attributes));
				},
				group: function(name){
					var g;
					this.each(function(){
						if(this.name === name){
							g = this;
						}
					});
					if(!g){
						g = global.canvas.group(name);
						this.append(g);
					}
					return g;
				},
				parent: new Prop({
					get: function(){
						return node.parent;
					},
					set: function(val){

					}
				})
			});
		},
		canvas: new Module({
			layers: new Prop({
				get: function(){
					return layers;
				}
			}),
			names: new Prop({
				get: function(){
					var n = [];
					layers.each(function(){
						n.push(this.name);
					});
					return n;
				}
			}),
			parents: new Prop({
				get: function(){
					var p = [];
					layers.each(function(){
						if(this.parent){
							p.push(this.parent);
						}
					});
					return parents;
				}
			}),
			get: function(name){
				var layer;
				layers.each(function(){
					if(this.name == name){
						layer = this;
					}
				});
				if(!layer){
					layer = new Canvas(name);
					layers.push(layer);
				}
				return layer;
			},
			drop: function(){
				this.each(function(){
					this.remove();
				});
			},
			refresh: function(){
				this.each(function(){
					var p = this.parent;
					this.remove();
					if(p){
						this.appendTo(p);
					}
				});
				return this;
			},
			shape: function(attributes){
				return new Shape(attributes);
			},
			group: function(name){
				return new Group(name);
			},
			each: function(fn){
				for(var i=0;i<layers.length;i++){
					fn.call(layers[i],i);
				}
				return this;
			}
		})
	});
})(window);