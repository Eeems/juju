(function(global,undefined){
	var dbs = {};
	global.extend({
		db: new Module({
			dbs: new Prop({
				get: function(){
					return dbs;
				}
			}),
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
			DB: function(db,struct){
				var self = this,
					i,
					n;
				self.extend({
					path: new Prop({
						get: function(){
							return self.name;
						}
					}),
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
			},
			Table: function(db,name){
				var self = this,
					count = 0,
					i,n,names;
				self.extend({
					path: new Prop({
						get: function(){
							return db.path+'.'+self.name;
						}
					}),
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
					indexes: {},
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
					fetch: function(){
						var req = self.store.count();
						req.onsuccess = function(e){
							count = e.target.result;
						};
					},
					add: function(value){
						var req = self.store.add(value);
						return new Promise(function(resolve,reject){
							req.onsuccess = function(e){
								resolve(e);
								self.fetch();
							};
							req.onerror = function(e){
								reject(e);
								self.fetch();
							};
						});
					},
					remove: function(index){
						var req = self.store.delete(index);
						return new Promise(function(resolve,reject){
							req.onsuccess = function(e){
								resolve(e);
								self.fetch();
							};
							req.onerror = function(e){
								reject(e);
								self.fetch();
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
								self.fetch();
							};
							req.onsuccess = function(e){
								resolve(e);
								self.fetch();
							};
						});
					},
					forEach: function(fn){
						var req = self.store.openCursor();
						return new Promise(function(resolve,reject){
							req.onerror = function(e){
								reject(e);
								self.fetch();
							};
							req.onsuccess = function(e){
								var cursor = e.target.result;
								if(cursor){
									fn.call(new global.db.CursorInterface(cursor,self.fetch),cursor.value,cursor.key);
									cursor.continue();
								}else{
									resolve(e);
									self.fetch();
								}
							};
						});
					},
					index: function(name){
						return self.indexes[name];
					},
					i: new Prop({
						get: function(){
							return self.indexes;
						}
					})
				});
				names = self.store.indexNames;
				for(i=0;i<names.length;i++){
					n = names[i];
					self.indexes[n] = new global.db.Index(self,n);
				}
				self.fetch();
				return self;
			},
			Index: function(table,name){
				var self = this,
					count = 0;
				self.extend({
					path: new Prop({
						get: function(){
							return table.path+'.'+self.name;
						}
					}),
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
					table: new Prop({
						value: table,
						writable: false
					}),
					index: new Prop({
						enumerable: false,
						get: function(){
							return table.store.index(name);
						}
					}),
					db: new Prop({
						get: function(){
							return table.db;
						}
					}),
					fetch: function(){
						var req = self.index.count();
						req.onsuccess = function(e){
							count = e.target.result;
						};
					},
					get: function(index){
						var req = self.index.get(index);
						return new Promise(function(resolve,reject){
							req.onsuccess = function(e){
								resolve(e.target.result);
							};
							req.onerror = function(e){
								reject(e);
							};
						});
					},
					forEach: function(fn){
						var req = self.index.openCursor();
						return new Promise(function(resolve,reject){
							req.onerror = function(e){
								reject(e);
								self.fetch();
							};
							req.onsuccess = function(e){
								var cursor = e.target.result;
								if(cursor){
									fn.call(new global.db.CursorInterface(cursor,self.fetch),cursor.value,cursor.key);
									cursor.continue();
								}else{
									resolve(e);
									self.fetch();
								}
							};
						});
					}
				});
				self.fetch();
				return self;
			},
			CursorInterface: function(cursor,fetch){
				fetch = fetch===undefined?function(){}:fetch;
				return new Module({
					update: function(val){
						var req = cursor.update(val);
						return new Promise(function(resolve,reject){
							req.onerror = function(e){
								reject(e);
								fetch();
							};
							req.onsuccess = function(e){
								resolve(e);
								fetch();
							};
						});
					},
					delete: function(){
						var req = cursor.delete();
						return new Promise(function(resolve,reject){
							req.onerror = function(e){
								reject(e);
								fetch();
							};
							req.onsuccess = function(e){
								resolve(e);
								fetch();
							};
						});
					},
					key: cursor.key,
					primaryKey: cursor.primaryKey,
					direction: cursor.direction
				});
			}
		})
	});
})(window);