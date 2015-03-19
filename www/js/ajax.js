(function(global,undefined){
	global.extend({
		Ajax: function(args,callback){
			args = {
				headers: {},
				type: 'GET',
				data: null,
				responseType: ''
			}.extend(args);
			args.type = args.type.toUpperCase();
			callback = callback===undefined?function(){}:callback;
			var req = new XMLHttpRequest(),i;
			req.onload = function(){
				callback.call(
					req,
					req.responseType===''?req.responseType:req.response,
					req.status
				);
			};
			for(i in args.headers){
				req.setRequestHeader(i,args.headers[i]);
			}
			req.open(args.type,args.url,true);
			if(args.responseType!==''){
				req.responseType = args.responseType;
			}else{
				req.overrideMimeType('text/plain; charset=x-user-defined');
			}
			req.send(args.data);
			this.req = req;
			return this;
		},
		ajax: new Module({
			get: function(url,callback){
				return new global.Ajax({
					url: url,
					type: 'get'
				},callback);
			},
			post: function(url,data,callback){
				return new global.Ajax({
					url: url,
					type: 'post',
					data: data
				},callback);
			}
		})
	});
})(window);