(function(global,undefined){
	var fetch = global.fetch;
	global.extend({
		fetch: function(url,args){
			if(fetch){
				return fetch.call(global,url,args);
			}else{
				args = {
					headers: {},
					method: 'GET',
					body: null,
					mode: 'same-origin',
					credentials: 'same-origin',
					cache: 'default'
				}.extend(args);
				args.method = args.method.toUpperCase();
				var req = new XMLHttpRequest(),i;
				for(i in args.headers){
					req.setRequestHeader(i,args.headers[i]);
				}
				req.open(args.method,url,true);
				if(args.responseType!==''){
					req.responseType = args.responseType;
				}else{
					req.overrideMimeType('text/plain; charset=x-user-defined');
				}
				return new Promise(function(resolve,reject){
					req.onload = function(){
						var res = {
								text: function(){
									this.bodyUsed = true;
									return req.responseText;
								},
								json: function(){
									this.bodyUsed = true;
									return req.responseType=='json'?req.response:JSON.parse(req.responseText);
								},
								blob: function(){
									this.bodyUsed = true;
									return req.responseType=='blob'?req.response:new Blob(req.responseText);
								},
								arrayBuffer: function(){
									this.bodyUsed = true;
									if(req.responseType=='arraybuffer'){
										return req.response;
									}else{
										var buf = new ArrayBuffer(req.responseText.length*2),
											bufView = new Uint16Array(buf),
											i;
										for (i=0, strLen=req.responseText.length; i < strLen; i++) {
											bufView[i] = req.responseText.charCodeAt(i);
										}
										return buf;
									}
								},
								formData: function(){
									this.bodyUsed = true;
									throw new Error('Not Implemented.');
								},
								bodyUsed: false,
								statusText: req.statusText,
								status: req.status,
								headers: (function(){
									var a = req.getAllResponseHeaders().split("\n");
									a.each(function(v,i,a){
										a[i] = v.split(':');
									});
									a = a.filter(function(v,i,a){
										return v.length>1;
									});
									return {
										append: function(name,value){
											a.push([name,value]);
										},
										delete: function(){
											a.each(function(v,i,a){
												if(v[0]==name){
													a.splice(i,1);
												}
											});
										},
										get: function(name){
											for(var i in a){
												if(a[i][0] == name){
													return a[i][1];
												}
											}
										},
										getAll: function(name){
											var h = [];
											a.each(function(v){
												if(v[0]==name){
													h.push(v[1]);
												}
											});
										},
										has: function(name){
											for(var i in a){
												if(a[i][0] == name){
													return true;
												}
											}
											return false;
										},
										set: function(name,value){
											this.delete(name);
											this.append(name,value);
										}
									};
								})(),
								url: url
							};
						resolve.call(this,res);
					};
					req.send(args.body);
				});
			}
		},
		get: function(url,callback){
			return global.fetch({
				url: url,
				method: 'get'
			},callback);
		},
		post: function(url,body,callback){
			return global.Ajax({
				url: url,
				method: 'post',
				body: body
			},callback);
		}
	});
})(window);