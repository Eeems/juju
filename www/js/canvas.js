(function(global,undefined){
	var layers = [],
		font;
	global.extend({
		Shape: function(attributes){
			var i,a,parent,
				values = {
					type: 'rectangle',
					width: undefined,
					height: undefined,
					baseline: 'top',
					colour: 'black',
					draw: 'fill',
					x: 0,
					y: 0,
					text: ''
				},
				o = {},
				prop = function(i){
					return new Prop({
						get: function(){
							return values[i];
						},
						set: function(val){
							values[i] = val;
							this.valid = false;
						}
					});
				};
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
				valid: false,
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
			for(i in values){
				o[i] = prop(i);
			}
			this.extend(o);
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
				valid: new Prop({
					get: function(){
						for(var i =0;i<children.length;i++){
							if(children[i]!==undefined){
								if(!children[i].valid){
									return false;
								}
							}
						}
						return true;
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
					console.log(this.id);
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
				children = [],
				styles = {};
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
				valid: new Prop({
					get: function(){
						if(node.parent.length===0 || (node.parent.length =1 && node.parent[0] === null)){
							return true;
						}
						for(i =0;i<children.length;i++){
							if(children[i]!==undefined){
								if(!children[i].valid){
									return false;
								}
							}
						}
						return true;
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
							if(context[i]!==undefined && styles[i] !== style[i]){
								styles[i] = style[i];
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
						node.each(function(){
							if(this.tagName == 'CANVAS'){
								this.width = val;
							}else{
								dom.get(this).width(val);
							}
						});
					}
				}),
				height: new Prop({
					get: function(){
						return node.height();
					},
					set: function(val){
						node.each(function(){
							if(this.tagName == 'CANVAS'){
								this.height = val;
							}else{
								dom.get(this).height(val);
							}
						});
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
					w = w===undefined?this.width:w;
					h = h===undefined?this.height:h;
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
					if(!this.valid){
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
												var b = self.baseline;
												self.baseline = c.baseline;
												if(c.draw == 'fill'){
													self.style({
														fillStyle: c.colour
													}).text(c.text,c.x,c.y,c.width);
												}else{
													self.style({
														strokeStyle: c.colour
													}).context.strokeText(c.text,c.x,c.y.c.width);
												}
												self.baseline = b;
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
										c.valid = true;
									}else{
										draw(c.children);
									}
								}
							};
						this.clear();
						draw(children);
					}
					return this;
				},
				remove: function(){
					try{
						node.remove();
					}catch(e){}
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
						try{
							node.remove();
						}catch(e){}
						node.appendTo(val);
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