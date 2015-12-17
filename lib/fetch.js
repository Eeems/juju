(function(global,undefined){
	var fetch = global.fetch,
		loading = [],
		loaded = [];
	if(!global.settings || !global.settings.fetch){
		global.settings.fetch = {
			log: {
				require: false,
				get: false,
				post: false
			},
			native: true
		};
	}
	global.extend({
		fetch: function(url,args){
			if(fetch && global.settings.fetch.native){
				return fetch.call(global,url,args);
			}else{
				args = {
					headers: {},
					method: 'GET',
					body: null,
					mode: 'same-origin',
					credentials: 'same-origin',
					cache: 'default'
				}.extend(args);
				args.method = args.method.toUpperCase();
				var req = new XMLHttpRequest(),i;
				for(i in args.headers){
					req.setRequestHeader(i,args.headers[i]);
				}
				if(['no-cache','reload','no-store'].indexOf(args.cache) != -1){
					url = url+'#ts='+now;
				}
				req.open(args.method,url,true);
				if(args.responseType!==''){
					req.responseType = args.responseType;
				}else{
					req.overrideMimeType('text/plain; charset=x-user-defined');
				}
				return new Promise(function(resolve,reject){
					req.onload = function(){
						var res = {
								text: function(){
									this.bodyUsed = true;
									return new Promise(function(resolve){
										resolve(req.responseText);
									});
								},
								json: function(){
									this.bodyUsed = true;
									return new Promise(function(resolve){
										resolve(req.responseType=='json'?req.response:JSON.parse(req.responseText));
									});
								},
								blob: function(){
									this.bodyUsed = true;
									return new Promise(function(resolve){
										resolve(req.responseType=='blob'?req.response:new Blob(req.responseText));
									});
								},
								arrayBuffer: function(){
									this.bodyUsed = true;
									var buf;
									if(req.responseType=='arraybuffer'){
										buf = req.response;
									}else{
										buf = new ArrayBuffer(req.responseText.length*2);
										var bufView = new Uint16Array(buf),
											i;
										for (i=0, strLen=req.responseText.length; i < strLen; i++) {
											bufView[i] = req.responseText.charCodeAt(i);
										}
										return buf;
									}
									return new Promise(function(resolve){
										resolve(buf);
									});
								},
								formData: function(){
									this.bodyUsed = true;
									return new Promise(function(resolve,reject){
										reject(new Error('Not Implemented.'));
									});
								},
								bodyUsed: false,
								statusText: req.statusText,
								status: req.status,
								headers: (function(){
									var a = req.getAllResponseHeaders().split("\n");
									a.forEach(function(v,i,a){
										a[i] = v.split(':');
									});
									a = a.filter(function(v,i,a){
										return v.length>1;
									});
									return {
										append: function(name,value){
											a.push([name,value]);
										},
										delete: function(){
											a.forEach(function(v,i,a){
												if(v[0]==name){
													a.splice(i,1);
												}
											});
										},
										get: function(name){
											for(var i in a){
												if(a[i][0] == name){
													return a[i][1];
												}
											}
										},
										getAll: function(name){
											var h = [];
											a.forEach(function(v){
												if(v[0]==name){
													h.push(v[1]);
												}
											});
										},
										has: function(name){
											for(var i in a){
												if(a[i][0] == name){
													return true;
												}
											}
											return false;
										},
										set: function(name,value){
											this.delete(name);
											this.append(name,value);
										}
									};
								})(),
								url: url
							};
						resolve.call(this,res);
					};
					req.send(args.body);
				});
			}
		},
		get: function(url,callback){
			if(global.settings.fetch.log.get){
				console.info('FETCH.GET('+url+')');
			}
			return global.fetch({
				url: url,
				method: 'get'
			},callback);
		},
		post: function(url,body,callback){
			if(global.settings.fetch.log.post){
				console.info('FETCH.POST('+url+')');
			}
			return global.Ajax({
				url: url,
				method: 'post',
				body: body
			},callback);
		},
		RequirePromise: function(fn){
			var p = new Promise(fn);
			p.extend({
				and: function(url){
					return new RequirePromise(function(resolve,reject){
						require(url)
							.then(function(){
								resolve();
							})
							.catch(reject);
					});
				}
			});
			return p;
		},
		included: new Prop({
			get: function(){
				var a = [];
				loading.forEach(function(v){
					a.push({
						loaded: false,
						path: v
					});
				});
				loaded.forEach(function(v){
					a.push({
						loaded: true,
						path: v
					});
				});
				return a;
			}
		}),
		require: function(url,nocache){
			var promise,
				load = function(url){
					if(global.settings.fetch.log.require){
						console.info('FETCH.REQUIRE('+url+')');
					}
					return new Promise(function(resolve,reject){
						if(loading.indexOf(url)!=-1){
							var fn = function(){
								if(widget.type(url)){
									resolve();
								}else{
									setTimeout(fn,1);
								}
							};
							fn();
						}else if(loaded.indexOf(url)==-1){
							loading.push(url);
							global.fetch(url,{
									cache: nocache?'no-cache':'only-if-cached'
								})
								.then(function(res){
									res.text().then(function(text){
										loading.splice(loading.indexOf(url),1);
										try{
											loaded.push(url);
											resolve(text);
										}catch(e){
											reject(e,url);
										}
									});
								}).catch(function(e){
									reject(e);
								});
						}else{
							resolve();
						}
					});
				};
			if(url instanceof Array){
				var queue = [],
					todo = url.length;
				promise = new global.RequirePromise(function(resolve,reject){
					url.forEach(function(url,i){
						load(url)
							.then(function(text){
								queue[i] = {
									text: text,
									url: url
								};
								todo--;
								if(!todo){
									var errors = [];
									queue.forEach(function(item){
										try{
											if(global.settings.fetch.log.require){
												console.info('LOAD('+item.url+')');
											}
											(new Function("//# sourceURL="+item.url+"\n"+item.text))();
										}catch(e){
											errors.push({
												error: e,
												url: item.url
											});
										}
									});
									if(!errors.length){
										resolve();
									}else{
										errors.forEach(function(item){
											console.info('Unable to load '+item.url);
											console.error(item.error);
										});
										reject(new Error(errors.length+' scripts failed to run.'));
									}
								}
							})
							.catch(function(e){
								todo--;
								if(!todo){
									var errors = [];
									queue.forEach(function(fn){
										try{
											fn();
										}catch(e){
											errors.push(e);
										}
									});
									if(errors.length){
										errors.forEach(function(e){
											console.error(e);
										});
										reject(new Error(errors.length+' scripts failed to run.'));
									}
								}
								reject(e);
							});
					});
				});
			}else{
				promise = new RequirePromise(function(resolve,reject){
					load(url)
						.then(function(text){
							if(global.settings.fetch.log.require){
								console.info('LOAD('+url+')');
							}
							(new Function("//# sourceURL="+url+"\n"+text))();
							resolve()
						})
						.catch(reject);
				});
			}
			return promise;
		}
	});
})(window);