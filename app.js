(function(global,undefined){
	"use strict";
	global.ready(function(){
		widget.require([
			'header',
			'nav',
			'section',
			'footer',
			'link',
			'input',
			'text',
			'button',
			'save'
		]).then(function(){
			dom.body.append(
				widget.new.section()
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
			);
		})
		.catch(function(e){
			console.error(e);
		});
	});
})(window);