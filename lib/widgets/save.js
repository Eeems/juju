new WidgetType({
	name: 'save',
	tagName: 'input',
	init: function(config){
		this.label = config.label===undefined?'Save':config.label;
	},
	render: function(){
		var self = this;
		self.body
			.attr({
				type: 'save',
				value: self.label
			})
			.text(self.label);
	}
});