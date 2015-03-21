(function(global,undefined){
	"use strict";
	global.extend({
		Nodes: function(){
			var i,
				args = flatten(arguments);
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
				each: function(fn){
					for(var i =0;i<this.length;i++){
						if(this[i]!==undefined){
							fn.call(this[i],i);
						}
					}
				},
				append: function(){
					var args = flatten(arguments);
					this.each(function(){
						try{
							for(var i in args){
								if(typeof args[i]=='string'){
									this.innerHTML += args[i];
								}else{
									this.appendChild(args[i]);
								}
							}
						}catch(e){
							console.warn(e);
						}
					});
					return this;
				},
				drop: function(selector){
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
						return this[0].outerWidth;
					}
				},
				height: function(val){
					if(val){
						this.each(function(){
							this.style.height = val+'px';
						});
						return this;
					}else{
						return this[0].outerHeight;
					}
				}
			});
			for(i=0;i<args.length;i++){
				this.push(args[i]);
			}
			return this;
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
			}
		})
	});
})(window);