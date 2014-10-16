global.ready(function(){
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
							return ws[name];
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