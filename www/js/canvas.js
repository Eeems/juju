(function(global,undefined){
	var layers = [],
		font;
	global.extend({
		Shape: function(attributes){
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
		},
		Canvas: function(name){
			var node = dom.create('canvas').attr({id:'canvas_'+now,name:'canvas_'+name}),
				context = node[0].getContext('2d'),
				shapes = [];
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
				shapes: new Prop({
					get: function(){
						return shapes;
					}
				}),
				add: function(attributes){
					if(attributes.name === '' || this.get(attributes.name) === undefined){
						shapes.push(new Shape(attributes));
					}
					return this;
				},
				get: function(i){
					if(typeof i == 'string'){
						for(var ii=0;ii<shapes.length;ii++){
							if(i == shapes[ii].name){
								return shapes[ii];
							}
						}
					}else if(typeof i == 'number'){
						return shapes[i];
					}
					return undefined;
				},
				drop: function(i){
					shapes.splice(i,1);
					return this;
				}
			});
		},
		canvas: new Module({
			layers: new Prop({
				get: function(){
					return layers;
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
			each: function(fn){
				for(var i=0;i<layers.length;i++){
					fn.call(layers[i],i);
				}
				return this;
			}
		})
	});
})(window);