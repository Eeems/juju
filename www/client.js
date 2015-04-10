// Going to stop using global in this script since it's loaded after everything else
ready(function(){
	console.log('init');
	var text = canvas.shape({
			type: 'text',
			text: 'Hello World!',
			x: -100
		}),
		text2 = canvas.shape({
			type: 'text',
			y: 15
		}),
		i = -100;
	ui.canvas.append(text).append(text2);
	// Move the text around
	setInterval(function(){
		text2.text = 'FPS: '+parseInt(fps,10);
		text.x = ++i;
		if(i>=ui.canvas.width+100){
			i=-100;
		}
	},10);
});