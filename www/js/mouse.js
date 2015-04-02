(function(global,undefined){
	var x,y,
		events = {
			click: [],
			up: [],
			down: [],
			over: [],
			out: [],
			dblclick: [],
			move: []
		};
	global.extend({
		mouse: new Module({
			x: new Prop({
				get: function(){
					return x;
				}
			}),
			y: new Prop({
				get: function(){
					return y;
				}
			}),
			click: function(fn){
				if(fn instanceof Function){
					events.click.push(fn);
				}else{
					for(var i=0;i<events.click.length;i++){
						try{
							events.click[i].call(this,{
								x: this.x,
								y: this.y,
								e: fn
							});
						}catch(e){}
					}
				}
				return this;
			},
			dblclick: function(fn){
				if(fn instanceof Function){
					events.dblclick.push(fn);
				}else{
					for(var i=0;i<events.dblclick.length;i++){
						try{
							events.dblclick[i].call(this,{
								x: this.x,
								y: this.y,
								e: fn
							});
						}catch(e){}
					}
				}
				return this;
			},
			up: function(fn){
				if(fn instanceof Function){
					events.up.push(fn);
				}else{
					for(var i=0;i<events.up.length;i++){
						try{
							events.up[i].call(this,{
								x: this.x,
								y: this.y,
								e: fn
							});
						}catch(e){}
					}
				}
				return this;
			},
			down: function(fn){
				if(fn instanceof Function){
					events.down.push(fn);
				}else{
					for(var i=0;i<events.down.length;i++){
						try{
							events.down[i].call(this,{
								x: this.x,
								y: this.y,
								e: fn
							});
						}catch(e){}
					}
				}
				return this;
			},
			over: function(fn){
				if(fn instanceof Function){
					events.over.push(fn);
				}else{
					for(var i=0;i<events.over.length;i++){
						try{
							events.over[i].call(this,{
								x: this.x,
								y: this.y,
								e: fn
							});
						}catch(e){}
					}
				}
				return this;
			},
			out: function(fn){
				if(fn instanceof Function){
					events.out.push(fn);
				}else{
					for(var i=0;i<events.out.length;i++){
						try{
							events.out[i].call(this,{
								x: this.x,
								y: this.y,
								e: fn
							});
						}catch(e){}
					}
				}
				return this;
			},
			move: function(fn){
				if(fn instanceof Function){
					events.move.push(fn);
				}else{
					for(var i=0;i<events.move.length;i++){
						try{
							events.move[i].call(this,{
								x: this.x,
								y: this.y,
								e: fn
							});
						}catch(e){}
					}
				}
				return this;
			}
		})
	});
	if(global instanceof Window){
		global.addEventListener('mousemove',function(e){
			x = e.clientX;
			y = e.clientY;
		});
		global.addEventListener('click',function(e){
			global.mouse.click(e);
		});
	}
})(window);