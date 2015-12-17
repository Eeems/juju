new WidgetType({
	name: 'input',
	tagName: 'div',
	init: function(config){
		if(!config.name){
			throw new Error('Input name must be defined');
		}
		this.name = config.name;
		if(config.label){
			this.label = config.label;
		}
		if(config.value){
			this.value = config.value;
		}
	},
	label: '',
	value: '',
	render: function(){
		var self = this;
		dom.create('label')
			.appendTo(this.body)
			.attr({
				id: this.id+'-label',
				for: this.id+'-input'
			})
			.text(this.label);
		dom.create('input')
			.appendTo(this.body)
			.attr({
				id: this.id+'-input',
				name: self.name
			})
			.on('change',function(){
				self.value = this.value;
			})
			.val(this.value);
	},
	val: function(val){
		if(val){
			this.value = val;
			this.body.get('input').value = val;
		}else{
			return this.value;
		}
	}
});