global.ready(function(){
	// Force context. Can't use sandbox due to using global window functions
	with(global){
		window.Nodes = function(){
			var nodes = this,
				i,
				compat = [
					'push','pop','concat','slice'
				],
				run = function(name){
					return new Function('return Array.prototype.'+name+'.apply(this,arguments)');
				},
				args = flatten(arguments);
			for(i in compat){
				nodes[compat[i]] = run(compat[i]);
			}
			for(i in args){
				nodes[i] = args[i];
			}
			nodes.length = args.length;
			extend(nodes,{
				get: function(selector){
					var list = new Nodes(),
						els, i;
					console.debug('DOM - GET '+selector);
					if(typeof selector == 'string'){
						this.each(function(){
							els = this.querySelectorAll(selector);
							for(i=0;i<els.length;i++){
								list.push(els[i]);
							}
						});
					}else if(selector !== undefined){
						list = new Nodes(selector);
					}
					return list;
				},
				each: function(fn){
					for(var i = 0;i<this.length;i++){
						if(this !== undefined){
							fn.call(this[i],i);
						}
					}
				},
				append: function(){
					console.debug('DOM - APPEND');
					var args = flatten(arguments);
					this.each(function(){
						try{
							console.debug('DOM - APPEND - PARENT: '+this.tagName);
							for(var i in args){
								console.debug('DOM - APPEND - CHILD: '+args[i]);
								this.appendChild(args[i]);
							}
						}catch(e){
							console.warn(e);
						}
					});
					return this;
				},
				drop: function(selector){
					console.debug('DOM - DROP '+selector);
					this.get(selector).remove();
					return this;
				},
				remove: function(){
					console.debug('DOM - REMOVE');
					this.each(function(){
						try{
							this.parentNode.removeChild(this);
						}catch(e){}
					});
					return this;
				},
				css: function(css){
					console.debug('DOM - CSS');
					this.each(function(){
						for(var ii in css){
							if(css[ii] !== undefined){
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
					console.debug('DOM - ATTR');
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
				fire: function(event){
					console.debug('DOM - FIRE/'+event);
					this.each(function(){
						var e = document.createEvent('HTMLEvents');
						e.initEvent(event,true,true);
						this.dispatchEvent(e);
					});
					return this;
				},
				on: function(event,fn){
					console.debug('DOM - ON/'+event);
					this.each(function(){
						try{
							if(this._eventHandlers === undefined){
								this._eventHandlers = {};
							}
							if(this._eventHandlers[event] === undefined){
								this._eventHandlers[event] = [];
							}
							this.addEventListener(
								event,
								this._eventHandlers[event][this._eventHandlers[event].push(fn)-1],
								false
							);
						}catch(e){
							console.warn(e);
						}
					});
					return this;
				},
				off: function(event,fn){
					if(event === undefined){
						console.debug('DOM - OFF/ALL');
						this.each(function(){
							for(var i in this._eventHandlers){
								new Nodes(this).off(i);
							}
						});
					}else{
						console.debug('DOM - OFF/'+event+'/'+(fn===undefined?'ALL':'SPECIFIC'));
						this.each(function(){
							try{
								var i;
								if(this._eventHandlers !== undefined && this._eventHandlers[event] !== undefined){
									if(fn === undefined){
										for(i in this._eventHandlers[event]){
											new Nodes(this).off(event,this._eventHandlers[event][i]);
										}
									}else{
										this.removeEventListener(event,fn);
										for(i=0;i<this._eventHandlers[event].length;i++){
											if(fn === this._eventHandlers[event][i]){
												this._eventHandlers[event].splice(i,1);
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
				}
			});
			return nodes;
		};
		extend(global,{
			Nodes: Nodes,
			dom: new Module({
				create: function(tag){
					console.debug('DOM - CREATE '+tag.toUpperCase());
					return global.dom.get(document.createElement(tag));
				},
				get: function(selector){
					return new Nodes(document).get(selector);
				},
				fragment: function(){
					console.debug('DOM - FRAGMENT');
					return new Nodes(document.createDocumentFragment());
				}
			},'dom')
		});
	}
},[
	'console',
	'sandbox'
]);