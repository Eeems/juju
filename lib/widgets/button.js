new WidgetType({
	name: 'button',
	tagName: 'button',
	init: function(config){
		this.label = config.label===undefined?'click me':config.label;
	},
	render: function(){
		var self = this;
		self.body
			.attr({
				value: self.label
			})
			.text(self.label);
	}
});