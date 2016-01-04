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
				self = this,
				args = flatten([].slice.call(arguments));
			self.extend({
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
				forEach: function(){
					return Array.prototype.forEach.apply(this,arguments);
				},
				filter: function(){
					return Array.prototype.filter.apply(this,arguments);
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
							this.children.each(function(){
								if(list.indexOf(this)==-1){
									list.push(this);
								}
							});
						});
						return list;
					},
					set: function(children){
						this.drop('*')
							.append(children);
						return true;
					}
				}),
				parent: new Prop({
					get: function(){
						var list = new Nodes();
						this.each(function(){
							if(list.indexOf(this.parentNode)==-1&&list.indexOf(this.parentNode)==-1){
								list.push(this.parentNode);
							}
						});
						return list;
					},
					set: function(parent){
						this.appendTo(parent);
						return true;
					}
				}),
				siblings: new Prop({
					get: function(){
						var list = new Nodes(),
							self = this;
						this.parent.each(function(){
							this.children.each(function(){
								if(self.indexOf(this)==-1&&list.indexOf(this)==-1){
									list.push(this);
								}
							});
						});
						return list;
					}
				}),
				classes: new Prop({
					get: function(){
						var classes = Array.from(this.length?this[0].classList:[]),
							p = new Proxy(classes,{
								get: function(target,name,reciever){
									return classes[name];
								},
								set: function(target,name,value){
									if(!!isNaN(name)){
										target[name] = value;
										self.classes = target;
										return true;
									}else{
										return false;
									}
								}
							});
						classes.item = function(id){
							return classes[id];
						};
						classes.contains = function(value){
							return classes.indexOf(value)!=-1;
						};
						classes.add = function(value){
							if(!classes.contains(value)){
								classes.push(value);
							}
							self.classes = classes;
						};
						classes.remove = function(value){
							while(classes.contains(value)){
								classes.splice(classes.indexOf(value),1);
							}
							self.classes = classes;
						};
						classes.toggle = function(value){
							if(classes.contains(value)){
								classes.remove(value);
							}else{
								classes.add(value);
							}
						};
						return p;
					},
					set: function(classes){
						if(classes instanceof String){
							classes = classes.split(' ');
						}
						if(classes instanceof Array){
							this.each(function(){
								var i,cls,el = this;
								for(i=0;i<el.classList.length;i++){
									cls = el.classList.item(i);
									if(classes.indexOf(cls)==-1){
										el.classList.remove(cls);
									}
								}
								classes.forEach(function(cls){
									if(!el.classList.contains(cls)){
										el.classList.add(cls);
									}
								});
							});
						}else{
							throw new Error('classes can only be set to instances of Arrays or string');
						}
					}
				}),
				value: new Prop({
					get: function(){
						return this.length>0?this[0].value:null;
					},
					set: function(val){
						this.each(function(){
							this.value = val;
						});
					}
				}),
				each: function(fn){
					this.forEach(function(el,i){
						if(el!==undefined){
							if(el instanceof Nodes){
								el.each(fn);
							}else{
								fn.call(el,i);
							}
						}
					});
					return self;
				},
				append: function(){
					var args = flatten([].slice.call(arguments)),
						self = this;
					this.each(function(){
						try{
							for(var i in args){
								if(typeof args[i]=='string'){
									this.innerHTML += args[i];
								}else if("Canvas" in global && args[i] instanceof Canvas){
									self.append(args[i].node);
								}else if(args[i] instanceof Nodes){
									args[i].each(function(){
										self.append(this);
									});
								}else if(args[i] instanceof Node){
									this.appendChild(args[i]);
								}else if("Widget" in global && args[i] instanceof Widget){
									self.append(args[i].render().body);
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
								self.children = html;
							}else{
								this.innerHTML = html;
							}
						});
						return this;
					}else{
						return this[0].innerHTML;
					}
				},
				fire: function(ev,data){
					this.each(function(){
						var e = document.createEvent('HTMLEvents');
						e.initEvent(ev,true,true);
						for(var i in data){
							try{
								e[i] = data[i];
							}catch(err){
								console.error(err);
							}
						}
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
				self[i] = args[i];
			}
			return self;
		},
		on: function(){
			global_node.on.apply(global_node,arguments);
			return this;
		},
		fire: function(){
			global_node.fire.apply(global_node,arguments);
			return this;
		},
		off: function(){
			global_node.off.apply(global_node,arguments);
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