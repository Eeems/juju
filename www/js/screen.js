global.ready(function(){
	with(global){
		var handlers = {
				resize: [],
				blur: [],
				focus: [],
				update: function(){}
			},
			lasttick = new Date().getTime(),
			playing = false,
			average = [],
			fps = 0,
			sum = function(a){
				return a.reduce(function(pv,cv){
					return pv+cv;
				},0);
			};
		extend(global,{
			screen: new Module({
				height: function(){
					return window.innerHeight;
				},
				width: function(){
					return window.innerWidth;
				},
				resize: function(fn){
					if(typeof fn === 'function'){
						handlers.resize.push(fn);
					}else{
						console.debug("SCREEN - RESIZE");
						for(var i=0;i<handlers.resize.length;i++){
							try{
								handlers.resize[i].apply(window,arguments);
							}catch(e){
								console.trace();
								console.warn(e);
							}
						}
						global.screen.update();
					}
					return this;
				},
				blur: function(fn){
					if(typeof fn === 'function'){
						handlers.blur.push(fn);
					}else{
						console.debug("SCREEN - BLUR");
						for(var i=0;i<handlers.blur.length;i++){
							try{
								handlers.blur[i].apply(window,arguments);
							}catch(e){
								console.trace();
								console.warn(e);
							}
						}
					}
					return this;
				},
				focus: function(fn){
					if(typeof fn === 'function'){
						handlers.focus.push(fn);
					}else{
						console.debug("SCREEN - FOCUS");
						for(var i=0;i<handlers.focus.length;i++){
							try{
								handlers.focus[i].apply(global,arguments);
							}catch(e){
								console.trace();
								console.warn(e);
							}
						}
					}
					return this;
				},
				update: function(fn){
					if(typeof fn == 'function'){
						handlers.update = fn;
					}else{
						fps = 1/((new Date().getTime() - lasttick)/1000);
						average.push(fps);
						if(average.length > 50){
							average.shift();
						}
						handlers.update.call(global,Math.round(sum(average)/average.length));
						lasttick = new Date().getTime();
					}
					return this;
				},
				pause: function(){
					playing = false;
					return this;
				},
				play: function(){
					playing = true;
					(function update(){
						if(playing){
							requestAnimationFrame(update);
							global.screen.update();
						}
					})();
					return this;
				}
			},'screen')
		});
		window.addEventListener('resize',function(){
			global.screen.resize.apply(this,arguments);
		},true);
		window.addEventListener('blur',function(){
			global.screen.blur.apply(this,arguments);
		},true);
		window.addEventListener('focus',function(){
			global.screen.focus.apply(this,arguments);
		},true);
		global.screen.play();
	}
},[
	'console',
	'dom'
]);