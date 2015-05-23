(function(global,undefined){
	global.extend({
		db: new Module({
			open: function(name,struct){
				return new Promise(function(resolve,reject){
					var req = indexedDB.open(name);
					req.onsuccess = function(e){
						resolve(new global.db.DB(e.target.result,struct));
					};
					req.onerror = function(e){
						console.trace(e);
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
					})
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
					tables:{},
					table: function(name){
						return self.tables[name];
					},
					t: new Prop({
						get: function(){
							return self.tables;
						}
					}),
					add: function(name,config){
						return new Promise(function(resolve,reject){
							var req = db.createObjectStore(name,config);
							req.onsuccess = function(e){
								self.tables[name] = new global.db.Table(self,name);
								resolve(self.table(name));
							};
							req.onerror = function(e){
								console.trace(e);
								reject(e);
							};
						});
					}
				});
				for(i in db.objectStoreNames){
					n = db.objectStoreNames[i];
					self.tables[n] = new global.db.Table(self,n);
				}
				return self;
			}
		})
	});
})(window);