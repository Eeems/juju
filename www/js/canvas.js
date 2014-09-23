global.ready(function(){
	function Canvas(name){
		var context = global.sandbox.context().context();
		while(name === undefined){
			name = name === undefined?name+''+now():name;
		}
		console.debug('CANVAS - CREATE - '+name);
		context.name = name;
		with(context){
			this.canvas = dom.create('canvas').css({
				position: 'absolute',
				left: 0,
				top: 0
			}).attr({
				id: 'canvas_'+name+'_'+now()
			});
			this.context = this.canvas[0].getContext('2d');
			return extend(this,{
				name: name,
				onupdate: function(){},
				update: function(fn){
					if(typeof fn == 'function'){
						this.onupdate = fn;
					}else{
						this.onupdate.apply(this,arguments);
						var i,c;
						for(i=0;i<this.children.length;i++){
							c = this.children[i];
							switch(c.type){
								case 'sprite':
									this.sprite(c.sprite,c.x,c.y,c.width,c.height);
								break;
								case 'text':
									if(c.draw == 'fill'){
										this.style({
											fillStyle: c.colour
										}).text(c.text,c.x,c.y,c.width);
									}else{
										this.style({
											strokeStyle: c.colour
										});
										this.context.strokeText(c.text,c.x,c.y.c.width);
									}
								break;
								default:
									this.rect(c.x,c.y,c.width,c.height);
									if(c.draw == 'fill'){
										this.style({
											fillStyle: c.colour
										}).fill();
									}else{
										this.style({
											strokeStyle: c.colour
										}).stroke();
									}
							}
						}
					}
					return this;
				},
				font: function(font){
					if(font === undefined){
						return this.context.font;
					}else{
						this.context.font = font;
						return this;
					}
				},
				baseline: function(baseline){
					if(baseline === undefined){
						return this.context.textBaseline;
					}else{
						this.context.textBaseline = baseline;
						return this;
					}
				},
				align: function(align){
					if(align === undefined){
						return this.context.textAlign;
					}else{
						this.context.textAlign = align;
						return this;
					}
				},
				style: function(style){
					for(var i in style){
						try{
							if(this.context[i] !== undefined){
								this.context[i] = style[i];
							}
						}catch(e){
							console.warn(e);
						}
					}
					return this;
				},
				clear: function(x,y,w,h){
					x = x|0;
					y = y|0;
					w = w===undefined?this.width():w;
					h = h===undefined?this.height():h;
					this.context.clearRect(x,y,w,h);
					return this;
				},
				stroke: function(){
					this.context.stroke();
					return this;
				},
				fill: function(){
					this.context.fill();
					return this;
				},
				width: function(w){
					if(w===undefined){
						return this.canvas.width();
					}else{
						this.canvas.width(w);
						return this;
					}
				},
				height: function(h){
					if(h===undefined){
						return this.canvas.height();
					}else{
						this.canvas.height(h);
						return this;
					}
				},
				rect: function(x,y,w,h){
					x = x|0;
					y = y|0;
					w = w===undefined?this.width():w;
					h = h===undefined?this.height():h;
					this.context.rect(x,y,w,h);
					return this;
				},
				fillRect: function(x,y,w,h){
					x = x|0;
					y = y|0;
					w = w===undefined?this.width():w;
					h = h===undefined?this.height():h;
					this.context.fillRect(x,y,w,h);
					return this;
				},
				strokeRect: function(x,y,w,h){
					x = x|0;
					y = y|0;
					w = w===undefined?this.width():w;
					h = h===undefined?this.height():h;
					this.context.strokeRect(x,y,w,h);
					return this;
				},
				text: function(text,x,y,w){
					this.context.fillText(text,x,y,w);
					return this;
				},
				attach: function(){
					this.canvas.css({
						display: 'block'
					});
					global.screen.resize();
					return this;
				},
				detach: function(){
					this.canvas.css({
						display: 'none'
					});
					global.screen.resize();
					return this;
				},
				sprite: function(img,x,y,w,h){
					//console.debug('CANVAS - SPRITE - '+img);
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
						this.context.drawImage(img,x,y,w,h);
					}
					return this;
				},
				measureText: function(){
					return this.context.measureText.apply(this.context,arguments);
				},
				children: [],
				add: function(attributes){
					if(attributes.name === '' || this.get(attributes.name) === undefined){
						return this.children[this.children.push(new Object(attributes))-1];
					}
					return false;
				},
				get: function(i){
					if(typeof i == 'string'){
						for(var ii=0;ii<this.children.length;ii++){
							if(i == this.children[ii].name){
								return this.children[ii];
							}
						}
					}else if(typeof i == 'number'){
						return this.children[i];
					}
					return undefined;
				},
				drop: function(i){
					this.children.splice(i,1);
					return this;
				}
			});
		}
	}
	function Object(attributes){
		var i,a,defaults = {
			type: 'rectangle',
			width: undefined,
			height: undefined,
			colour: 'black',
			draw: 'fill',
			x: 0,
			y: 0,
			name: '',
			text: ''
		};
		for(i in defaults){
			this[i] = defaults[i];	
		}
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
				case 'x':case 'y':case 'name':
					this[i] = a;
				break;
			}
		}
		return this;
	}
	var stack = [],
		parents = [];
	global.extend(global,{
		canvas: new Module({
			layer: function(name){
				var layer;
				for(var i=0;i<stack.length;i++){
					if(stack[i].name == name){
						layer = stack[i];
						break;
					}
				}
				if(layer === undefined){
					console.debug('CANVAS - NEW LAYER - '+name);
					layer = new Canvas(name).attach();
				}
				stack.push(layer);
				return layer;
			},
			each: function(fn){
				for(var i = 0;i<stack.length;i++){
					fn.call(stack[i],i);
				}
				return this;
			},
			update: function(){
				this.each(function(){
					this.onupdate();
				});
				return this;
			},
			appendTo: function(selector){
				var p = global.dom.get(selector);
				this.each(function(i){
					p.append(this.canvas);
					this.canvas.css({
						zIndex: ++i
					});
				});
				if(parents.indexOf(p) == -1){
					parents.push(p);
				}
				return this;
			},
			refresh: function(){
				var p = parents;
				this.drop().appendTo(p);
				return this;
			},
			drop: function(){
				this.each(function(){
					for(i=0;i<parents.length;i++){
						parents[i].drop();
					}
				});
				parents = [];
				return this;
			},
			getLayerId: function(canvas){
				for(var i=0;i<stack.length;i++){
					if(stack[i] === canvas){
						return i;
					}
				}
				return -1;
			},
			order: function(){
				var i,
					newstack = [],
					args = arguments,
					add = function(){
						if(this.name == args[i] && newstack.indexOf(this) == -1){
							newstack.push(this);
						}
					};
				for(i=0;i<args.length;i++){
					this.each(add);
				}
				this.each(function(){
					if(newstack.indexOf(this) == -1){
						newstack.push(this);
					}
				});
				stack = newstack;
				this.refresh();
				return this;
			},
			layers: function(){
				var names = [];
				global.canvas.each(function(){
					names.push(this.name);
				});
				return names;
			},
			parents: parents,
			stack: stack
		},'canvas'),
		Canvas: Canvas
	});
},[
	'console',
	'dom',
	'sandbox',
	'screen'
]);