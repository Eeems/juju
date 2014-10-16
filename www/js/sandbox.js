global.ready(function(undefined){
	function SandBox(context){
		var mask = {},
			i,
			ctx ={};
		// Create a mask to keep code from accessing the global scope
		for(i in window){
			mask[i] = undefined;
		}
		// create the context from the mask
		ctx = global.extend(mask,context);
		ctx = global.extend(ctx,{
			Math: window.Math,
			console: console,
			setInterval: function(){
				return window.setInterval.apply(window,arguments);
			},
			setTimeout: function(){
				return window.setTimeout.apply(window,arguments);
			},
			clearInterval: function(){
				return window.clearInterval.apply(window,arguments);
			},
			clearTimeout: function(){
				return window.clearTimeout.apply(window,arguments);
			}
		});
		// Handle the two normal global viariable names.
		ctx.window = ctx;
		ctx.global = context;
		return {
			name: global.hash(ctx+''),
			context: function(){
				return global.extend({},ctx);
			},
			run: function(fn){
				// Force the function to execute in the correct scope
				// I know, with is bad, but this is the one time I find it useful
				// If only it was allowed in "use strict";
				try{
					if(typeof fn != 'function'){
						fn = 'function(){'+fn+'}';
					}
					fn = new Function('with(this){return ('+fn+')();}');
					// Run with this referencing the global scope
					return fn.apply(ctx);
				}catch(e){
					console.error(e);
					console.trace();
					console.warn('Error when running '+this.name+'/'+global.hash(fn+''));
					console.debug(fn+'');
				}
				return false;
			}
		};
	}
	global.extend(global,{
		sandbox: new Module({
			create: function(context){
				return new SandBox(context);
			},
			run: function(fn){
				return (new SandBox(global)).run(fn);
			},
			context: function(){
				return new SandBox(global);
			}
		},'sandbox')
	});
},[]);