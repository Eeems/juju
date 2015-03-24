exports.Prop = function(props){
	for(var i in props){
		this[i] = props[i];
	}
	return this;
};
Object.prototype.extend = function(ext){
	console.log(this);
	var i,o,p,fn = function(name){
		if(o[name]){
			p[name] = o[name];
		}
	};
	for(i in ext){
		o = ext[i];
		if(o instanceof Prop){
			p = {};
			fn('get');
			fn('set');
			fn('value');
			fn('enumerable');
			fn('configurable');
			fn('writable');
			Object.defineProperty(this,i,p);
		}else{
			this[i] = o;
		}
	}
	return this;
};
Array.prototype.each = function(fn){
	for(var i=0;i<this.length;i++){
		fn.call(this[i],i);
	}
};
exports.extend = Object.prototype.extend;