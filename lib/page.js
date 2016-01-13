(function(global,undefined){
	var fake = {
			hidden: new Prop({
				get: function(){
					return false;
				}
			}),
			visibilityState: new Prop({
				get: function(){
					return 'visible';
				}
			})
		},
		location,
		urlp = function(url){
			var u = {};
			if(url instanceof Location){
				u = url;
			}else{
				var a = dom.create('a').attr({href:url})[0];
				u.extend({
					assign: function(url){
						location = urlp(url);
						for(var i in location){
							try{
								this[i] = location[i];
							}catch(e){}
						}
					},
					replace: function(){
						this.assign.apply(this,arguments);
					},
					reload: function(){},
					protocol: a.protocol,
					hostname: a.hostname,
					port: a.port,
					pathname: a.pathname,
					search: a.search,
					hash: a.hash,
					host: a.host
				});
			}
			u.extend({
				get: new Prop({
					get: function(){
						var r = [];
						this.search
							.replace(/^\?/, '')
							.split('&')
							.forEach(function(v){
								if(v.length>0){
									r.push(v.split('='));
								}
							});
						return r;
					}
				}),
				path: new Prop({
					get: function(){
						var r = [];
						this.pathname
							.split('/')
							.forEach(function(v){
								if(this.length>0){
									r.push(v);
								}
							});
						return r;
					}
				}),
				hashget: new Prop({
					get: function(){
						var r = [];
						this.hash
							.substr(1)
							.replace(/^\?/, '')
							.split('&')
							.forEach(function(v){
								if(v.length>0){
									r.push(v.split('='));
								}
							});
						return r;
					}
				}),
				hashpath: new Prop({
					get: function(){
						var r = [];
						this.hash
							.substr(1)
							.split('/')
							.forEach(function(v){
								if(v.length>0){
									r.push(v);
								}
							});
						return r;
					}
				})
			});
			return u;
		},
		d = document || fake;
	if(d === fake){
		d.extend({
			location: new Prop({
				get: function(){
					if(!location){
						location = urlp('about:blank');
					}
					return location;
				},
				set: function(url){
					location = urlp(url);
				}
			})
		});
	}else{
		urlp(d.location);
	}
	global.extend({
		page: new Module({
			visible: new Prop({
				get: function(){
					return !d.hidden;
				}
			}),
			hidden: new Prop({
				get: function(){
					return d.hidden;
				}
			}),
			state: new Prop({
				get: function(){
					return d.visibilityState;
				}
			}),
			url: new Prop({
				get: function(){
					return d.location;
				}
			}),
			title: new Prop({
				get: function(){
					return document.title;
				},
				set: function(title){
					dom.get('title').html(title);
					fire('titlechange',{
						data:title
					});
				}
			})
		})
	});
})(window);