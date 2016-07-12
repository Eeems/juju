new WidgetType({
	name: 'input',
	tagName: 'div',
	init: function(config){
		config.attributes = config.attributes || {};
		if(!config.name){
			throw new Error('Input name must be defined');
		}
		var self = this;
		if(config.label){
			self.label = config.label;
		}
		if(config.value){
			self.value = config.value;
		}
		Object.defineProperty(config.attributes,'name',{
			get: function(){
				return self.name;
			},
			set: function(val){
				self.name = val;
			}
		});
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
			.attr({
				id: this.id+'-input',
				name: self.name
			})
			.appendTo(this.body)
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