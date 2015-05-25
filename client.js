// Going to stop using global in this script since it's loaded after everything else
ready(function(){
	console.log('init');
	var text = canvas.shape({
			type: 'text',
			text: 'Hello World!',
			x: -100,
			y: 30
		}),
		text2 = canvas.shape({
			type: 'text',
			y: 15
		}),
		i = -100;
	ui.canvas.shape({
		colour: 'blue'
	}).append(text).append(text2);
	// Move the text around
	setInterval(function(){
		text2.text = 'FPS: '+parseInt(fps,10);
		text.x = ++i;
		if(i>=ui.canvas.width+100){
			i=-100;
		}
	},10);
	db.setup('test',{
		test: {
			config: {
				autoIncrement: true,
				keyPath: 'id'
			},
			indexes: {
				id: {
					path: 'id',
					unique: true
				}
			},
			values: [
				{
					id: 0,
					value: 'test'
				},
				{
					id: 1,
					value: 'testing'
				},
				{
					id: 2,
					value: 'something'
				}
			]
		}
	}).then(function(db){
		db.table('test').forEach(function(item){
			if(item.id === 0){
				item.value = +new Date;
				this.update(item).then(function(){
					console.log(item);
				});
			}else if(item.id == 1){
				this.delete(item);
			}else{
				console.log(item);
			}
		});
	}).catch(function(e){
		console.trace(e);
	});
});