// Going to stop using global in this script since it's loaded after everything else
ready(function(){
	console.log('init');
	var text = canvas.shape({
			type: 'text',
			text: 'Hello World!',
			x: -100,
			y: 0
		}),
		i = -100;
	ui.canvas.append(text);
	// Move the text around
	setInterval(function(){
		text.x = ++i;
		if(i>=ui.canvas.width+100){
			i=-100;
		}
	},10);
});