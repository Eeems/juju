(function(global,undefined){
	var UserInterface = function(node){
		node = node instanceof Nodes?node:dom.get(node);
		
	};
	global.extend({
		UserInterface: function(node){
			return new UserInterface(node);
		},
		ui: new UserInterface(dom.body)
	});
})(window);