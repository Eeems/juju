(function(global,undefined){
	var dbs = {};
	global.extend({
		db: new Module({
			setup: function(name,struct){
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
						var db = new global.db.DB(e.target.result,struct);
						dbs[name] = db;
						resolve(db);
					};
					req.onerror = function(e){
						reject(e);
					};
					req.onblocked = function(e){
						reject(e);
					};
				});
			},
			delete: function(name){
				var req = indexedDB.deleteDatabase(name);
				return new Promise(function(resolve,reject){
					req.onsuccess = function(e){
						resolve(e);
						delete dbs[name];
					};
					req.onerror = function(e){
						reject(e);
					};
				});
			},
			get: function(name){
				return dbs[name];
			},
			Table: function(db,name){
				var self = this,
					count = 0,
					updatecount = function(){
						var req = self.store.count();
						req.onsuccess = function(e){
							count = e.target.result;
						};
					};
				self.extend({
					name: new Prop({
						get: function(){
							return name;
						}
					}),
					count: new Prop({
						get: function(){
							return count;
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
					keyPath: new Prop({
						get: function(){
							return self.store.keyPath;
						}
					}),
					add: function(value){
						var req = self.store.add(value);
						return new Promise(function(resolve,reject){
							req.onsuccess = function(e){
								resolve(e);
								updatecount();
							};
							req.onerror = function(e){
								reject(e);
								updatecount();
							};
						});
					},
					remove: function(index){
						var req = self.store.delete(index);
						return new Promise(function(resolve,reject){
							req.onsuccess = function(e){
								resolve(e);
								updatecount();
							};
							req.onerror = function(e){
								reject(e);
								updatecount();
							};
						});
					},
					get: function(index){
						var req = self.store.get(index);
						return new Promise(function(resolve,reject){
							req.onsuccess = function(e){
								resolve(e.target.result);
							};
							req.onerror = function(e){
								reject(e);
							};
						});
					},
					update: function(index,newval){
						return new Promise(function(resolve,reject){
							self.get(index)
								.then(function(oldval){
									var i,req;
									for(i in newval){
										oldval[i] = newval[i];
									}
									req = self.store.put(oldval);
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
					},
					trunc: function(){
						return new Promise(function(resolve,reject){
							var req = self.store.clear();
							req.onerror = function(e){
								reject(e);
								updatecount();
							};
							req.onsuccess = function(e){
								resolve(e);
								updatecount();
							};
						});
					},
					forEach: function(fn){
						var req = self.store.openCursor();
						return new Promise(function(resolve,reject){
							req.onerror = function(e){
								reject(e);
								updatecount();
							};
							req.onsuccess = function(e){
								var cursor = e.target.result;
								if(cursor){
									fn.call({
											update: function(val){
												var req = cursor.update(val);
												return new Promise(function(resolve,reject){
													req.onerror = function(e){
														reject(e);
														updatecount();
													};
													req.onsuccess = function(e){
														resolve(e);
														updatecount();
													};
												});
											},
											delete: function(){
												var req = cursor.delete();
												return new Promise(function(resolve,reject){
													req.onerror = function(e){
														reject(e);
														updatecount();
													};
													req.onsuccess = function(e){
														resolve(e);
														updatecount();
													};
												});
											},
											key: cursor.key,
											primaryKey: cursor.primaryKey,
											direction: cursor.direction
										},
										cursor.value,
										cursor.key
									);
									cursor.continue();
								}else{
									resolve(e);
									updatecount();
								}
							};
						});
					}
				});
				updatecount();
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
		}),
		dbs: new Prop({
			get: function(){
				return dbs;
			}
		})
	});
})(window);