(function(global,undefined){
	var UserInterface = function(node){
		// Make sure that we are using a Nodes object
		node = node instanceof Nodes?node:dom.get(node);
		// Mouse handler. Or reuse if global
		var mouse = node===global?global.mouse:new Mouse(node);
		this.extend({
			mouse: new Prop({
				get: function(){
					return mouse;
				}
			}),
			node: new Prop({
				get: function(){
					return node;
				}
			})
		});
		return this;
	};
	global.extend({
		UserInterface: function(node){
			return new UserInterface(node);
		},
		ui: new UserInterface(global)
	});
})(window);