var fs = require('fs'),
	app = require('node-static'),
	http = require('http'),
	//toobusy = require('toobusy'),
	config = require('../etc/server.json');
process.chdir(__dirname+'/..');
console.log('Running from context '+process.cwd());
exports.start = function(folder,port,host){
	console.log('Starting server for '+folder+' on '+host+':'+port);
	var file = new app.Server(folder,{
		gzip: true,
		serverInfo: 'juju/node-static/0.0.1'
	});
	return http.createServer(function(req,res){
		//if(!toobusy()){
			if(req.url == '/etc/settings.json'){
				console.log('Serving client settings');
				res.writeHead(200,{
					"Content-Type": 'application/json'
				});
				fs.readFile('etc/client.json',function(e,d){
					if(!e){
						try{
							JSON.parse(d);
							console.log('  Settings have no errors');
							res.end(d);
						}catch(err){
							e = err;
						}
					}
					if(e){
						console.log('  Settings have errors');
						console.error(e);
						res.end("{\"debug\": false}");
					}
				});
			}else if(req.url.substr(0,7) == '/debug/'){
				var type = req.url.substr(7,req.url.indexOf('/',7)-7),
					data = decodeURIComponent(req.url.substr(req.url.indexOf('/',7)+1));
				switch(type){
					case 'log':
						console.log('DEBUG - '+data);
					break;
					default:
						console.log('DEBUG('+type+') - '+data);
				}
				res.end();
			}else{
				console.log('Serving '+req.url);
				file.serve(req,res);
			}
		// }else{
		// 	res.writeHead(503);
		// 	return res.end();
		// }
	}).listen(port,host,2048);
};

if(!module.parent){
	exports.start(config.data,config.port,config.host);
}