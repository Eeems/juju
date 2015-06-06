(function(global,undefined){
	var stores = {};
	global.extend({
		Store: function(name,config){
			if(stores[name]!==undefined){
				throw new Error('Store '+name+' already exists!');
			}
			config = config?config:{};
			if(config.persist===undefined){
				config.persist = true;
			}
			if(config.autocommit===undefined){
				config.autocommit = true;
			}
			var self = this,
				values = [],
				lastId,
				flush = function(){
					if(config.autocommit){
						self.commit();
					}
				};
			self.extend({
				id: new Prop({
					readonly: true,
					value: 'juju-store-'+(config.persist?'persist':'session')+'-'+name
				}),
				name: new Prop({
					readonly: true,
					value: name
				}),
				config: new Prop({
					readonly: true,
					value: config
				}),
				length: new Prop({
					get: function(){
						return values.length;
					}
				}),
				lastId: new Prop({
					get: function(){
						return lastId;
					}
				}),
				json: new Prop({
					get: function(){
						return JSON.stringify(values);
					}
				}),
				dirty: new Prop({
					get: function(){
						return self.json!=localStorage.getItem(self.id);
					}
				}),
				values: new Prop({
					get: function(){
						return values;
					},
					set: function(vals){
						values = vals;
						lastId = vals.length-1;
						flush();
					}
				}),
				push: function(value){
					lastId = values.push(value)-1;
					flush();
					return self;
				},
				insert: function(id,value){
					lastId = id;
					values.insert(id,value);
					return self;
				},
				replace: function(id,value){
					lastId = id;
					values.splice(id,1,value);
					flush();
					return self;
				},
				pop: function(){
					if(lastId==values.length-1){
						lastId = 0;
					}
					var r = values.pop();
					flush();
					return r;
				},
				shift: function(){
					if(lastId!==0){
						lastId--;
					}
					var r = values.shift();
					flush();
					return r;
				},
				unshift: function(value){
					lastId++;
					values.unshift(value);
					flush();
					return self;
				},
				remove: function(id){
					if(id == lastId){
						lastId = 0;
					}else if(id<lastId){
						lastId--;
					}
					values.splice(id,1);
					flush();
					return self;
				},
				indexOf: function(value){
					return values.indexOf(value);
				},
				has: function(value){
					return self.indexOf(value)!=-1;
				},
				get: function(id){
					return values[id];
				},
				each: function(fn){
					values.each(fn);
					lastId = values.length-1;
					return self;
				},
				rollback: function(){
					values = localStorage.getItem(self.id);
					try{
						values = JSON.parse(values);
					}catch(e){
						values = [];
					}
					return self;
				},
				commit: function(){
					if(config.persist){
						localStorage.setItem(self.id,self.json);
					}
					return self;
				}

			});
			if(config.persist){
				json = localStorage.getItem(self.id);
				try{
					values = JSON.parse(json);
				}catch(e){
					values = [];
				}
				if(config.autoflush){
					if(global instanceof Window){
						global.addEventListener('beforeunload',self.commit);
					}
				}
			}
			stores['name'] = self;
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
		global.addEventListener('storage',function(e){
			for(var i in stores){
				if(stores[i].id == e.key){
					console.log(e);
					stores[i].rollback();
				}
			}
		});
	}
})(window);