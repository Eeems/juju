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
						new Table(db.objectStoreNames[i]);
					}
				},
				onerror: function(e){
					self.errorCode = e.target.errorCode;
					throw e;
				},
				onupgradeneeded: function(e){
					var i,ii,table,item,index;
					for(i in structure){
						item = structure[i];
						if(item.config){
							self.createTable(i,item.config);
							if(item.indexes){
								for(ii in item.indexes){
									index = item.indexes[ii];
									table.createIndex(ii,index.path,index.params);
								}
							}
							if(item.data){
								for(ii in item.data){
									table.add(item.data);
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
					return new Table(name);
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
					var indexes = [];
					this.extend({
						db: new Prop({
							get: function(){
								return db;
							}
						}),
						createIndex: function(name,path,params){

							return this;
						},
						Index: function(name){

						}
					});
					tables.push(this);
					return this;
				}
			});
			return self;
		},
		db: new Module({
			create: function(name,structure){
				var db = new Database(name,structure);
				databases.push(db);
				return db;
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