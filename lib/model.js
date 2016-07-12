(function(global,undefined){
	"use strict";
	var models = {};
	global.extend({
		Model: function(name,config){
			if(name in models){
				throw new Error('Model '+name+' already exists.');
			}
			var self = function(data){
				rec = new Proxy(this,{
					get: function(target, property, receiver){
						if(!(property in config)){
							throw new Error('Record does not contain '+property);
						}
						return target[property];
					},
					set: function(target, property, value, receiver){
						if(!(property in config)){
							throw new Error('Record does not contain '+property);
						}
						// normalize value here
						target[property] = value;
						return true;
					},
					has: function(target, prop){
						return prop in config;
					}
				});
				for(var name in config){
					rec[name] = data[name];
				}
				return rec;
			};
			models[name] = self;
			return self;
		},
		models: new Prop({
			get: function(){
				return models;
			}
		})
	});
})(window);