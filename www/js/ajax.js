global.ready(function(){
	with(global.sandbox.context().context()){
		extend(global,{
			ajax: new Module({
				ajax: function(args,callback){
					args = extend(
{						headers: {},
						type: 'GET',
						data: null,
						responseType: ''
					},args);
					args.type = args.type.toUpperCase();
					callback = callback === undefined?function(){}:callback;
					console.debug('AJAX - CREATING REQUEST FOR '+args.url);
					console.debug('AJAX - TYPE '+args.type);
					console.debug('AJAX - responseType '+args.responseType);
					var req = new XMLHttpRequest(),
						i;
					req.onload = function(){
						callback.call(
							req,
							req.responseType===''?req.responseText:req.response,
							req.status
						);
					};
					for(i in args.headers){
						console.debug('AJAX - ADDING HEADER - '+i+': '+args.headers[i]);
						req.setRequestHeader(i,args.headers[i]);
					}
					req.open(args.type,args.url,true);
					if(args.responseType !== ''){
						req.responseType = args.responseType;
					}else{
						req.overrideMimeType("text/plain; charset=x-user-defined");
					}
					req.send(args.data);
					return req;
				},
				get: function(url,callback){
					return global.ajax.ajax({
						url: url,
						type: 'get'
					},callback);
				},
				post: function(url,data,callback){
					return global.ajax.ajax({
						url: url,
						type: 'post',
						data: data
					},callback);
				}
			},'ajax')
		});
	}
},[
	'sandbox'
]);