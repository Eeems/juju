(function(global,undefined){
	var u = new URL('about:blank'),
		fake = {
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
		d = document || fake;
	if(d === fake){
		d.extend({
			assign: function(url){
				var u = new URL(url),
					i;
				for(i in u){
					try{
						this[i] = u[i];
					}catch(e){}
				}
			},
			replace: function(){
				this.assign.apply(this,arguments);
			},
			reload: function(){}
		});
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
			})
		})
	});
})(window);