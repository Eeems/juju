(function(global,undefined){
	var databases = [];
	global.extend({
		Database: function(name,structure){
			var req = indexedDB.open(name,3),
				db,
				tables = [],
				self = this;
			req.extend({
				onsuccess: function(e){
					db = e.target.result;
					for(var i=0;i<db.objectStoreNames.length;i++){
						new self.Table(db.objectStoreNames[i]);
					}
					console.info('Database '+name+' synced');
				},
				onerror: function(e){
					self.errorCode = e.target.errorCode;
					throw e;
				},
				onupgradeneeded: function(e){
					var i,ii,table,item,index;
					db = e.target.result;
					for(i in structure){
						item = structure[i];
						if(item.config){
							table = db.createObjectStore(i,item.config);
							if(item.indexes){
								for(ii in item.indexes){
									index = item.indexes[ii];
									table.createIndex(ii,index.path,index.params);
								}
							}
							if(item.data){
								for(ii=0;ii<item.data.length;ii++){
									try{
										table.add(item.data[ii]);
									}catch(e){}
								}
							}
						}

					}
				}
			});
			self.extend({
				errorCode: 0,
				name: new Prop({
					get: function(){
						return db.name;
					}
				}),
				req: new Prop({
					get: function(){
						return req;
					}
				}),
				db: new Prop({
					get: function(){
						return db;
					}
				}),
				tables: new Prop({
					get: function(){
						return tables;
					}
				}),
				createTable: function(name,config){
					db.createObjectStore(name,config);
					return new self.Table(name);
				},
				table: function(name){
					for(var i in tables){
						if(tables[i].name === name){
							return tables[i];
						}
					}
					throw new Error('Table '+name+' does not exist');
				},
				Table: function(name){
					var self = this,
						indexes = [],
						records = [],
						count = 0,
						getCount = function(){
							var req = store().count();
							req.extend({
								onsuccess: function(){
									count = req.result;
								},
								onerror: function(e){
									console.error(e);
								}
							});
						},
						store = function(){
							try{
								transaction = db.transaction(name,"readwrite");
								transaction.extend({
									oncomplete: function(){
										console.info(db.name+'.'+name+' flushed to disk');
									},
									onabort: function(){
										console.info(db.name+'.'+name+' changes aborted');
									},
									onerror: function(e){
										console.error(e);
									}
								});
							}catch(e){
								console.error(e);
							}
							return transaction.objectStore(name);
						};
					self.extend({
						name: new Prop({
							get: function(){
								return name;
							}
						}),
						db: new Prop({
							get: function(){
								return db;
							}
						}),
						count: new Prop({
							get: function(){
								return count;
							}
						}),
						store: new Prop({
							get: function(){
								return store();
							}
						}),
						add: function(item,callback){
							var req = store().add(item);
							req.extend({
								oncomplete: function(){
									callback.call(self,e);
									getCount();
								},
								onerror: function(){
									callback.call(self,e);
								}
							});
							return self;
						},
						remove: function(key,callback){
							self.get(key).delete(callback);
							return self;
						},
						get: function(key){
							return new self.Record(key);
						},
						each: function(callback){
							var req = store().openCursor();
							req.extend({
								onsuccess: function(){
									var c = req.result;
									if(c){
										callback.call(self,c.value);
										c.continue();
									}
								},
								onerror: function(e){
									console.error(e);
								}
							});
							return self;
						},
						createIndex: function(name,path,params){

							return self;
						},
						Index: function(name){
							var self = this,
								data,
								req = store().index(name);
							req.extend({
								onsuccess: function(){
									data = req.result;
								},
								onerror: function(){
									throw new Error('Index '+name+'does not exist');
								}
							});
							self.extend({
								data: new Prop({
									get: function(){
										return data;
									}
								}),
								'delete': function(callback){
									var req = store().deleteIndex(name);
									req.extend({
										onsuccess: function(e){
											callback.call(self,e);
											indexes.slice(indexes.indexOf(self),1);
											for(var i in self){
												try{
													delete self[i];
												}catch(e){}
											}
											self = undefined;
										},
										onerror: function(e){
											callback.call(self,e);
										}
									});
								}
							});
							indexes.push(self);
							return self;
						},
						Record: function(key){
							var self = this,
								data,
								drop = function(callback,e){
									callback = callback || function(){};
									records.slice(records.indexOf(self),1);
									callback.call(self,e||{});
									for(var i in self){
										try{
											delete self[i];
										}catch(e){}
									}
									self = undefined;
									getCount();
								},
								req = store().get(key);
							req.extend({
								onsuccess: function(e){
									if(req.result){
										data = req.result;
									}else{
										drop();
									}
								},
								onerror: function(e){
									drop(undefined,e);
								}
							});
							self.extend({
								data: new Prop({
									get: function(){
										return data;
									},
									set: function(val){
										var req = store().put(data);
										req.extend({
											onsuccess: function(){
												data = val;
											},
											onerror: function(){
												throw new Error('Unable to update record '+key);
											}
										});
									}
								}),
								'delete': function(callback){
									var req = store().delete(key);
									req.extend({
										oncomplete: function(e){
											drop(callback,e);
										},
										onerror: function(){
											callback.call(self,e);
										}
									});
								}
							});
							records.push(self);
							return self;
						},
						'delete': function(callback){
							var req = db.deleteObjectStore(name);
							req.extend({
								oncomplete: function(){
									tables.slice(tables.indexOf(self),1);
									callback.call(self,e);
									for(var i in self){
										try{
											delete self[i];
										}catch(e){}
									}
									self = undefined;
								},
								onerror: function(){
									callback.call(self,e);
								}
							});
						}
					});
					tables.push(self);
					getCount();
					return self;
				},
				'delete': function(callback){
					db.close();
					var req = indexedDB.deleteDatabase(name);
					req.extend({
						oncomplete: function(){
							databases.slice(databases.indexOf(self),1);
							callback.call(self,e);
						},
						onerror: function(){
							callback.call(self,e);
						}
					});
				}
			});
			global.on('beforeunload',function(){
				db.close();
			});
			databases.push(self);
			return self;
		},
		db: new Module({
			create: function(name,structure){
				return new Database(name,structure);
			},
			get: function(name){
				for(var i in databases){
					if(databases[i].name === name){
						return databases[i];
					}
				}
				throw new Error('Database '+name+' does not exist');
			}
		})
	});
})(window);