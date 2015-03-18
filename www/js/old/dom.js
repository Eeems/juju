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
								if(typeof args[i] == 'string'){
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
				text: function(text){
					console.debug('DOM - TEXT');
					if(text !== undefined){
						this.each(function(){
							this.textContent = text;
						});
						return this;
					}else{
						return this[0].textContent;
					}
				},
				html: function(html){
					if(html !== undefined){
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
					console.debug('DOM - GET '+selector);
					return new Nodes(document).get(selector);
				},
				fragment: function(){
					console.debug('DOM - FRAGMENT');
					return new Nodes(document.createDocumentFragment());
				}
			},'dom')
		});
	}
	// Force context. Can't use sandbox due to using global window functions
	with(global){
		window.Socket = function(url,protocols){
			console.debug('SOCKET CREATE '+url);
			var self = this,
				ws,
				i,
				onopen = [],
				onmessage = [],
				onerror = [],
				onclose = [],
				stack = function(stack,self,args){
					for(var i in stack){
						try{
							stack[i].apply(self,args);
						}catch(e){
							console.error(e);
						}
					}
				},
				props = [
					'protocol',
					'readyState',
					'url',
					'extensions',
					'bufferedAmount',
					'binaryType',

				],
				prop = function(name){
					Object.defineProperty(self,name,{
						get: function(){
							return ws===undefined?undefined:ws[name];
						}
					});
				};
			extend(self,{
				open: function(fn){
					if(fn !== undefined){
						onopen.push(fn);
					}else{
						if(ws !== undefined){
							ws.close();
						}
						try{
							ws = new WebSocket(url,protocols);
							ws.onopen = function(){
								console.debug('SOCKET EVENT OPEN - '+url);
								stack(onopen,this,arguments);
							};
							ws.onmessage = function(msg){
								console.debug('SOCKET EVENT MESSAGE - '+url+' - '+msg.data);
								stack(onmessage,this,arguments);
							};
							ws.onerror = function(){
								console.debug('SOCKET EVENT ERROR - '+url);
								stack(onerror,this,arguments);
							};
							ws.onclose = function(e){
								console.debug('SOCKET EVENT CLOSE - '+url+' - ('+e.code+') '+e.reason);
								stack(onclose,this,arguments);
							};
						}catch(e){
							console.error(e);
						}
					}
					return self;
				},
				message: function(fn){
					if(fn instanceof Function){
						onmessage.push(fn);
					}else{
						stack(onmessage,this,arguments);
					}
					return self;
				},
				error: function(fn){
					if(fn instanceof Function){
						onerror.push(fn);
					}else{
						stack(onerror,this,arguments);
					}
					return self;
				},
				close: function(fn){
					if(fn instanceof Function){
						onclose.push(fn);
					}else{
						ws.close.apply(ws,arguments);
					}
					return self;
				},
				send: function(msg){
					console.debug('SOCKET SEND DATA - '+msg);
					ws.send.apply(ws,arguments);
				}
			});
			for(i in props){
				prop(props[i]);
			}
			return self;
		};
		extend(global,{
			Socket: Socket,
			socket: new Module({
				create: function(url,protocal){
					return new Socket(url,protocal);
				}
			},'socket')
		});
	}
},[]);