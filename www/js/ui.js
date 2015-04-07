(function(global,undefined){
	var UserInterface = function(node){
		node = node instanceof Nodes?node:dom.get(node);
		var mouse = new Mouse(node);
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