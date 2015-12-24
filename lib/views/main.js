new View('main',function(){
	return widget.new.section()
		.add({
			type: 'input',
			name: 'alert-value',
			label: 'Alert value:'
		})
		.add({
			type: 'button',
			label: 'Display Alert',
			events:{
				click: function(){
					alert(dom.get('[name=alert-value]').val());
				}
			}
		})
		.render()
		.body
},function(){},function(){});