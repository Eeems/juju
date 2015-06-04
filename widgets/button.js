new WidgetType({
	name: 'button',
	tagName: 'button',
	init: function(config){
		if(config.label === undefined){
			throw new Error('a button label must be defined');
		}
		this.label = config.label;
	},
	render: function(){
		this.body
			.attr({
				value: this.label
			})
			.text(this.label);
	}
});