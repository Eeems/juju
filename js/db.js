(function(global,undefined){
	global.extend({
		db: new Module({
			open: function(name,struct){
				return new Promise(function(resolve,reject){
					var req = indexedDB.open(name);
					req.onupgradeneeded = function(e){
						var i,ii,table,ostore,index;
						for(i in struct){
							table = struct[i];
							ostore = e.target.result.createObjectStore(i,table.config);
							if(table.indexes){
								for(ii in table.indexes){
									index = table.indexes[ii];
									ostore.createIndex(ii,index.path,index.config);
								}
							}
							if(table.values){
								ostore.transaction.oncomplete = function(){
									ostore = e.target.result.transaction(i,'readwrite').objectStore(i);
									table.values.forEach(function(value){
										ostore.add(value);
									});
								};
							}
						}
					};
					req.onsuccess = function(e){
						resolve(new global.db.DB(e.target.result,struct));
					};
					req.onerror = function(e){
						reject(e);
					};
					req.onblocked = function(e){
						reject(e);
					};
				});
			},
			Table: function(db,name){
				var self = this;
				self.extend({
					name: new Prop({
						get: function(){
							return name;
						}
					}),
					db: new Prop({
						value: db,
						writable: false
					}),
					store: new Prop({
						get: function(){
							return db.transaction.objectStore(name);
						}
					}),
					add: function(value){
						var req = self.store.add(value);
						return new Promise(function(resolve,reject){
							req.onsuccess = function(e){
								resolve(e);
							};
							req.onerror = function(e){
								reject(e);
							};
						});
					},
					remove: function(index){
						var req = self.store.delete(index);
						return new Promise(function(resolve,reject){
							req.onsuccess = function(e){
								resolve(e);
							};
							req.onerror = function(e){
								reject(e);
							};
						});
					},
					get: function(index){
						var store = self.store,
							req = store.get(index);
						return new Promise(function(resolve,reject){
							req.onsuccess = function(e){
								resolve(e.result,store);
							};
							req.onerror = function(e){
								reject(e);
							};
						});
					},
					update: function(index,newval){
						return new Promise(function(resolve,reject){
							self.get(index)
								.then(function(oldval,store){
									var i,req;
									for(i in newval){
										oldval[i] = newval[i];
									}
									req = store.put(oldval);
									req.onerror = function(e){
										reject(e);
									};
									req.onsuccess = function(e){
										resolve(e);
									};
								})
								.catch(function(e){
									reject(e);
								});
						});
					}
				});
				return self;
			},
			DB: function(db,struct){
				var self = this,
					i,
					n;
				self.extend({
					name: new Prop({
						get: function(){
							return db.name;
						}
					}),
					version: new Prop({
						get: function(){
							return db.version;
						}
					}),
					transaction: new Prop({
						get: function(){
							return db.transaction([self.name],'readwrite');
						}
					}),
					tables:{},
					table: function(name){
						return self.tables[name];
					},
					t: new Prop({
						get: function(){
							return self.tables;
						}
					}),
					db: new Prop({
						enumerable: false,
						get: function(){
							return db;
						}
					}),
					struct: new Prop({
						value: struct,
						writable: false
					}),
					flush: function(){
						self.close();
						global.db.open(self.name).then(function(ndb){
							db = ndb;
							db.onversionchange = function(e){
								self.close();
								alert('This page is outdated. Reloading page.');
								location.reload();
							};
							db.onerror = function(e){
								console.trace(e);
							};
							db.onabort = function(e){
								console.trace(e);
							};
						}).catch(function(){
							console.trace(e);
						});
					},
					close: function(){
						db.close();
					}
				});
				for(i=0;i<db.objectStoreNames.length;i++){
					n = db.objectStoreNames[i];
					self.tables[n] = new global.db.Table(self,n);
				}
				addEventListener('beforeunload',function(){
					self.close();
				});
				return self;
			}
		})
	});
})(window);