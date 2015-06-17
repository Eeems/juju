(function(global,undefined){
	var stores = {};
	global.extend({
		Store: function(name,config){
			if(stores[name]!==undefined){
				throw new Error('Store '+name+' already exists!');
			}
			config = config?config:{};
			if(config.engine===undefined){
				config.engine = 'localStorage';
			}
			if(config.autocommit===undefined){
				config.autocommit = true;
			}
			var self = this,
				flush = function(){
					if(config.autocommit){
						self.commit();
					}
				},
				StorePromise = function(callback){
					var p = new Promise(function(){
							var scope = this,
								args = arguments,
								fn = function(){
									var d = db.get(self.id);
									if(d){
										callback.apply(scope,args);
									}else{
										setTimeout(fn,10);
									}
								};
							fn();
						}),
						i,
						proxy = function(i){
							p[i] = function(){
								return self[i].apply(self,arguments);
							};
						},
						names = [
							'add',
							'remove',
							'get',
							'update',
							'forEach',
							'each',
							'trunc',
							'commit',
							'rollback'
						];
					for(i in names){
						proxy(names[i]);
					}
					return p;
				},
				TablePromise = function(){
					var table,
						p = new Promise(function(resolve,reject){
							var fn = function(){
								var d = db.get(self.id);
								if(d){
									var t = d.table(self.id);
									if(t){
										resolve(t);
									}else{
										reject();
									}
								}else{
									setTimeout(fn,10);
								}
							};
							fn();
						}),
						i,
						proxy = function(i){
							p[i] = function(){
								var args = arguments,
									scope = this;
								return this.then(function(table){
									console.log(i,scope,args);
									return table[i].apply(scope,args);
								});
							};
						},
						names = [
							'add',
							'remove',
							'get',
							'update',
							'forEach',
							'each',
							'trunc'
						];
					for(i in names){
						proxy(names[i]);
					}
					return p;
				},
				engine = (function(){
					var values = [],
						e = {
								dirty: false,
								add: function(v){
									return new StorePromise(function(resolve){
										values.push(v);
										resolve();
									});
								},
								remove: function(i){
									return new StorePromise(function(resolve,reject){
										if(values[i]){
											delete values[i];
											resolve();
										}else{
											reject();
										}
									});
								},
								get: function(i){
									return new StorePromise(function(resolve,reject){
										if(values[i]){
											resolve(values[i]);
										}else{
											reject();
										}
									});
								},
								update: function(i,v){
									return new StorePromise(function(resolve,reject){
										if(values[i]){
											values[i] = v;
											resolve();
										}else{
											reject();
										}
									});
								},
								forEach: function(fn){
									return new StorePromise(function(resolve){
										for(var i in values){
											fn.call(self,i,values[i]);
										}
										resolve();
									});
								},
								each: function(fn){
									return e.forEach(fn);
								},
								trunc: function(){
									return new StorePromise(function(resolve){
										values = [];
										resolve();
									});
								},
								commit: function(){
									return new StorePromise(function(resolve){
										resolve();
									});
								},
								rollback: function(){
									return new StorePromise(function(resolve){
										resolve();
									});
								},
								indexOf: function(data){
									return new StorePromise(function(resolve){
										resolve(values.indexOf(data));
									});
								},
								has: function(data){
									return new StorePromise(function(resolve){
										e.indexOf(data)
											.then(function(i){
												resolve(i!=-1);
											});
									});
								}
							};
					switch(config.engine){
						case 'localStorage':
							e.extend({
								dirty: new Prop({
									get: function(){
										return JSON.stringify(values) != localStorage.getItem(self.id);
									}
								}),
								commit: function(){
									return new StorePromise(function(resolve){
										localStorage.storeItem(self.id,JSON.stringify(values));
										resolve();
									});
								},
								rollback: function(){
									return new StorePromise(function(resolve){
										values = localStorage.getItem(self.id);
										try{
											values = JSON.parse(values);
											resolve();
										}catch(e){
											values = [];
											reject();
										}
									});
								}
							});
						break;
						case 'indexedDB':
							db.setup('juju-store-'+name,(function(){
								var conf = {};
								conf['juju-store-'+name] = {
									config: {
										autoIncrement: true,
										keyPath: 'id'
									},
									indexes: {
										id: {
											path: 'id',
											unique: true
										}
									}
								};
								return conf;
							})(),+new Date);
							e.extend({
								dirty: new Prop({
									get: function(){
										return values.length>0;
									}
								}),
								table: new Prop({
									get: function(){
										return new TablePromise();
									}
								}),
								add: function(v){
									return new StorePromise(function(resolve){
										values.push({
											type: 'add',
											data: v
										});
										resolve();
									});
								},
								remove: function(i){
									return new StorePromise(function(resolve,reject){
										values.push({
											type: 'remove',
											index: i
										});
										resolve();
									});
								},
								get: function(i){
									return new StorePromise(function(resolve,reject){
										e.table.get(i)
											.then(resolve)
											.catch(reject);
									});
								},
								update: function(i,v){
									v.extend({
										id: i
									});
									return new StorePromise(function(resolve,reject){
										values.push({
											type: 'update',
											index: i,
											data: v
										});
										resolve();
									});
								},
								forEach: function(fn){
									return new StorePromise(function(resolve,reject){
										e.table.forEach(fn)
											.then(resolve)
											.catch(reject);
									});
								},
								each: function(fn){
									return e.forEach(fn);
								},
								trunc: function(){
									return new StorePromise(function(resolve){
										values.push({
											type: 'trunc'
										});
										resolve();
									});
								},
								commit: function(){
									return new StorePromise(function(resolve,reject){
										if(e.dirty){
											var item = values.shift();
											switch(item.type){
												case 'add':
													e.table.add(item.data)
														.then(e.commit)
														.catch(reject);
												break;
												case 'remove':
													e.table.remove(item.index)
														.then(e.commit)
														.catch(reject);
												break;
												case 'update':
													e.table.update(item.index,item.data)
														.then(e.commit)
														.catch(reject);
												break;
												case 'trunc':
													e.table.trunc()
														.then(e.commit)
														.catch(reject);
												break;
												default:
													reject();
											}
										}else{
											e.rollback();
											resolve();
										}
									});
								},
								rollback: function(){
									return new StorePromise(function(resolve){
										values = [];
										resolve();
									});
								},
								indexOf: function(data){
									var id;
									return new StorePromise(function(resolve){
										if(data.id!==undefined){
											e.get(data.id)
												.then(function(){

												}).catch(function(){
													resolve(-1);
												});
										}else{
											e.forEach(function(d,i){
												if(!id){
													for(var ii in data){
														if(d[ii] != data[ii]){
															return;
														}
														id = d.id;
													}
												}
											}).then(function(){
												id = id===undefined?-1:id;
												resolve(id);
											}).catch(function(){
												resolve(-1);
											});
										}
									});
								}
							});
						break;
					}
					return e;
				})();
			self.extend({
				id: new Prop({
					readonly: true,
					value: 'juju-store-'+name
				}),
				name: new Prop({
					readonly: true,
					value: name
				}),
				config: new Prop({
					readonly: true,
					value: config
				}),
				engine: new Prop({
					get: function(){
						return engine;
					}
				}),
				length: new Prop({
					get: function(){
						return values.length;
					}
				}),
				dirty: new Prop({
					get: function(){
						return engine.dirty;
					}
				}),
				push: function(value){
					return engine.add(value).then(function(){
						flush();
						return arguments;
					});
				},
				insert: function(id,value){
					return engine.update(id,value).then(function(){
						flush();
						return arguments;
					});
				},
				replace: function(id,value){
					return engine.update(id,value).then(function(){
						flush();
						return arguments;
					});
				},
				unshift: function(value){
					values.unshift(value);
					flush();
					return self;
				},
				remove: function(id){
					return engine.delete(id).then(function(){
						flush();
						return arguments;
					});
				},
				indexOf: function(value){
					return e.indexOf(value);
				},
				has: function(value){
					return e.has(value);
				},
				get: function(id){
					return values[id];
				},
				each: function(fn){
					return engine.each(fn).then(function(){
						flush();
						return arguments;
					});
				},
				rollback: function(){
					return engine.rollback();
				},
				commit: function(){
					return engine.commit();
				}

			});
			if(config.persist){
				json = localStorage.getItem(self.id);
				try{
					values = JSON.parse(json);
					console.log('Loaded persistant values for store '+self.name);
				}catch(e){
					values = [];
					console.log('Initialized persistant values forstore '+self.name);
				}
				if(config.autocommit){
					if(global instanceof Window){
						global.addEventListener('beforeunload',self.commit);
					}
				}
			}
			stores[name] = self;
			return self;
		},
		store: function(name){
			var store = stores[name];
			if(store!==undefined){
				return store;
			}
			return false;
		}
	});
	if(global instanceof Window){
		addEventListener('storage',function(e){
			for(var i in stores){
				if(stores[i].id == e.key){
					console.log(e);
					stores[i].rollback();
				}
			}
		});
	}
})(window);