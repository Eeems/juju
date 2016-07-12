new View('main',{
	render: function(){
		return widget.new.section({
			children: [
				{
					type: 'input',
					name: 'alert-value',
					label: 'Alert value:'
				},
				{
					type: 'button',
					label: 'Display Alert',
					events:{
						click: function(){
							alert(dom.get('[name=alert-value]').val());
						}
					}
				}
			]
		});
	}
});