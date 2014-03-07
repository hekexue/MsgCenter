define(function() {
	var runtimeData = {},
	runtimeObj = {
			set:function(key,value){
				key&&(runtimeData[key] = value);
			},
			get:function(key){
				return runtimeData[key]||false;
			},
			clear : function(prefix) {
				var k;
				for(k in runtimeData) {
					if(k.indexOf(prefix) == 0){
						delete runtimeData[k];
					}
				}
			}
	}
	return runtimeObj;
})