(function(global,undefined){
	"use strict";
	// Enhance DOMTokenList, NodeList and HTMLCollection
	[
		'forEach',
		'map',
		'filter',
		'reduce',
		'reduceRight',
		'every',
		'some',
		'push',
		'pop',
		'slice',
		'shift',
		'unshift',
		'indexOf'
	].forEach(function(p){
		NodeList.prototype[p] = HTMLCollection.prototype[p] = Array.prototype[p];
	});
	DOMTokenList.prototype.indexOf = Array.prototype.indexOf;
	global.extend({
		Nodes: function(){
			var i,
				args = flatten(Array.slice(arguments));
			this.extend({
				length: args.length,
				push: function(){
					return Array.prototype.push.apply(this,arguments);
				},
				pop: function(){
					return Array.prototype.pop.apply(this,arguments);
				},
				concat: function(){
					return Array.prototype.concat.apply(this,arguments);
				},
				slice: function(){
					return Array.prototype.slice.apply(this,arguments);
				},
				indexOf: function(){
					return Array.prototype.indexOf.apply(this,arguments);
				},
				get: function(selector){
					var list = new Nodes(),
						els,i;
					if(typeof selector === 'string'){
						this.each(function(){
							els = this.querySelectorAll(selector);
							for(i=0;i<els.length;i++){
								list.push(els[i]);
							}
						});
					}else if (selector !== undefined){
						list = new Nodes(selector);
					}
					return list;
				},
				child: function(id){
					return args[id]?new Nodes(args[id]):new Nodes();
				},
				children: new Prop({
					get: function(){
						var list = new Nodes();
						this.each(function(){
							var i,c;
							for(i=0;i<this.children.length;i++){
								c = this.children[i];
								if(list.indexOf(c)==-1){
									list.push(c);
								}
							}
						});
						return list;
					}
				}),
				parent: new Prop({
					get: function(){
						var list = new Nodes();
						this.each(function(){
							if(list.indexOf(this.parentNode)==-1){
								list.push(this.parentNode);
							}
						});
						return list;
					}
				}),
				siblings: new Prop({
					get: function(){
						var list = new Nodes(),
							self = this;
						this.parent.each(function(){
							var i,c;
							for(i=0;i<this.children.length;i++){
								c = this.children[i];
								if(self.indexOf(c)==-1&&list.indexOf(c)==-1){
									list.push(c);
								}
							}
						});
						return list;
					}
				}),
				value: new Prop({
					get: function(){
						return this[0].value;
					},
					set: function(val){
						this.each(function(){
							this.value = val;
						});
					}
				}),
				each: function(fn){
					for(var i =0;i<this.length;i++){
						if(this[i]!==undefined){
							fn.call(this[i],i);
						}
					}
					return self;
				},
				append: function(){
					var args = flatten(Array.slice(arguments)),
						self = this;
					this.each(function(){
						try{
							for(var i in args){
								if(typeof args[i]=='string'){
									this.innerHTML += args[i];
								}else if(args[i] instanceof Canvas){
									self.append(args[i].node);
								}else if(args[i] instanceof Nodes){
									args[i].each(function(){
										self.append(this);
									});
								}else if(args[i] instanceof Node){
									this.appendChild(args[i]);
								}
							}
						}catch(e){
							console.warn(e);
						}
					});
					return this;
				},
				appendTo: function(parents){
					parents = parents instanceof Nodes?parents:new Nodes(document).get(parents);
					parents.append(this);
					return this;
				},
				drop: function(selector){
					this.get(selector).remove();
					return this;
				},
				remove: function(){
					this.each(function(){
						try{
							this.parentNode.removeChild(this);
						}catch(e){}
					});
					return this;
				},
				css: function(css){
					this.each(function(){
						for(var ii in css){
							if(css[ii]!==undefined){
								try{
									this.style[ii] = css[ii];
								}catch(e){
									console.warn(e);
								}
							}
						}
					});
					return this;
				},
				attr: function(attr){
					this.each(function(){
						for(var ii in attr){
							try{
								this[ii] = attr[ii];
							}catch(e){
								console.warn(e);
							}
						}
					});
					return this;
				},
				text: function(text){
					if(text!==undefined){
						this.each(function(){
							this.textContent = text;
						});
						return this;
					}else{
						return this[0].textContent;
					}
				},
				val: function(val){
					if(val!==undefined){
						this.each(function(){
							this.value = val;
						});
						return this;
					}else{
						return this[0].value;
					}
				},
				html: function(html){
					if(html!==undefined){
						this.each(function(){
							var self = new Nodes(this);
							if(html instanceof Nodes){
								self.drop('*');
								self.append(html);
							}else{
								this.innerHTML = html;
							}
						});
						return this;
					}else{
						return this[0].innerHTML;
					}
				},
				fire: function(ev){
					this.each(function(){
						var e = document.createEvent('HTMLEvents');
						e.initEvent(ev,true,true);
						this.dispatchEvent(e);
					});
					return this;
				},
				on: function(ev,fn){
					this.each(function(){
						try{
							if(this._eventHandlers === undefined){
								this._eventHandlers = {};
							}
							if(this._eventHandlers[ev] === undefined){
								this._eventHandlers[ev] = [];
							}
							this.addEventListener(
								ev,
								this._eventHandlers[ev][this._eventHandlers[ev].push(fn)-1],
								false
							);
						}catch(e){
							console.warn(e);
						}
					});
					return this;
				},
				off: function(ev,fn){
					if(ev===undefined){
						this.each(function(){
							for(var i in this._eventHandlers){
								new Nodes(this).off(i);
							}
						});
					}else{
						this.each(function(){
							try{
								var i;
								if(this._eventHandlers!==undefined&&this._eventHandlers[ev]!==undefined){
									if(fn===undefined){
										for(i in this._eventHandlers[ev]){
											new Nodes(this).off(ev,this._eventHandlers[ev][i]);
										}
									}else{
										this.removeEventListener(ev,fn);
										for(i=0;i<this._eventHandlers[ev].length;i++){
											if(fn===this._eventHandlers[ev][i]){
												this._eventHandlers[ev].splice(i,1);
											}
										}
									}
								}
							}catch(e){
								console.warn(e);
							}
						});
					}
					return this;
				},
				width: function(val){
					if(val){
						this.each(function(){
							this.style.width = val+'px';
						});
						return this;
					}else{
						return this[0].offsetWidth;
					}
				},
				height: function(val){
					if(val){
						this.each(function(){
							this.style.height = val+'px';
						});
						return this;
					}else{
						return this[0].offsetHeight;
					}
				}
			});
			for(i=0;i<args.length;i++){
				this[i] = args[i];
			}
			return this;
		},
		on: function(){
			global_node.on.apply(this,arguments);
			return this;
		},
		fire: function(){
			global_node.fire.apply(this,arguments);
			return this;
		},
		off: function(){
			global_node.off.apply(this,arguments);
			return this;
		},
		each: function(fn){
			fn.call(this,0);
		},
		dom: new Module({
			create: function(tag){
				return global.dom.get(document.createElement(tag));
			},
			get: function(selector){
				return new Nodes(document).get(selector);
			},
			fragment: function(){
				return new Nodes(document.createDocumentFragment());
			},
			body: new Prop({
				get: function(){
					return new Nodes(document.body);
				}
			})
		})
	});
	var global_node = new Nodes(global);
})(window);