(function(global,undefined){
	global.extend({
		cookie:{
			get: function(name){
				var parts = ("; "+document.cookie).split("; "+name+"=");
				if(parts.length == 2){
					return parts.pop().split(";").shift();
				}
			},
			set: function(name,value){
				document.cookie = name+"="+value;
			},
			keys: function(){
				var a = document.cookie.split(';');
				a.forEach(function(v,i){
					a[i] = v.split('=')[0];
				});
				return a;
			}
		}
	});
})(window);