global.ready(function(){
	with(global.sandbox.context().context()){
		var map = [],
			tileset = [],
			layer = canvas.layer('map');
		extend(global,{
			map: new Module({
				reset: function(){
					map = [];
					tileset = [];
					layer.clear();
					return this;
				},
				load: function(name,callback){
					callback = callback === undefined?function(){}:callback;
					ajax.get('maps/'+name+'.map?v='+version,function(newmap){
						global.map.fromString(newmap);
						ajax.get('maps/'+name+'.tiles?v='+version,function(newtileset){
							tileset = JSON.parse(newtileset);
							var i,
								loaded = 0,
								imgload = function(){
									if(++loaded == tileset.length){
										callback.call(map,map);
									}
								};
							for(i=0;i<tileset.length;i++){
								console.debug('MAP - LOADING TILE - '+tileset[i]);
								tileset[i] = dom.create('img').attr({
									src: tileset[i]+'?v='+version
								}).on('load',imgload);
							}
						});
					});
					return this;
				},
				fromString: function(string){
					var m = string.replace("\r",'').split("\n"),
						i,
						l,
						n,
						ii;
					for(i=0;i<m.length;i++){
						l = m[i];
						m[i] = [];
						for(ii=0;ii<l.length;ii++){
							m[i][ii] = parseInt(l.charAt(ii),16);
						}
					}
					map = m;
					return m;
				},
				drawMap: function(vx,vy){
					var i,ii;
					for(i=0;i<map.length;i++){
						for(ii=0;ii<map[i].length;ii++){
							if(tileset[map[i][ii]] !== undefined){
								//console.debug('MAP - TILE - '+map[i][ii]+' ('+ii+','+i+')');
								layer.sprite(tileset[map[i][ii]],ii*16,i*16,16,16);
							}
						}
					}
					return this;
				},
				tileset: function(){
					return tileset;
				},
				getTile: function(id){
					return tileset[id];
				},
				current: function(){
					return map;
				},
				drawTile: function(id,x,y){
					layer.sprite(tileset[id],x,y);
					return this;
				},
				tileAt: function(x,y){
					return map[y][x];
				}
			},'map')
		});
	}
},[
	'console',
	'dom',
	'sandbox',
	'canvas',
	'ajax'
]);