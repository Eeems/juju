new WidgetType({
	name: 'button',
	tagName: 'button',
	init: function(config){
		if(config.label === undefined){
			throw new Error('Text must be defined');
		}
		this.label = config.label;
		this.onclick = config.onclick===undefined?function(){}:config.onclick;
	},
	render: function(){
		this.body
			.attr({
				value: this.label
			})
			.text(this.label)
			.on('click',this.onclick);
	}
});