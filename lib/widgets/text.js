new WidgetType({
	name: 'text',
	tagName: 'span',
	init: function(config){
		if(config.text === undefined){
			throw new Error('Text must be defined');
		}
		this.text = config.text;
	},
	render: function(){
		this.body.text(this.text);
	}
});