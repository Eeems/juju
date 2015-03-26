exports.Prop = function(props){
	for(var i in props){
		this[i] = props[i];
	}
	return this;
};
exports.extend = function(self,ext){
	var i,
		o,
		p,
		fn = function(name){
			if(o[name]){
				p[name] = o[name];
			}
		};
	for(i in ext){
		o = ext[i];
		if(o instanceof exports.Prop){
			p = {};
			fn('get');
			fn('set');
			fn('value');
			fn('enumerable');
			fn('configurable');
			fn('writable');
			Object.defineProperty(self,i,p);
		}else{
			self[i] = o;
		}
	}
};
Array.prototype.each = function(fn){
	for(var i=0;i<this.length;i++){
		fn.call(this[i],i);
	}
};