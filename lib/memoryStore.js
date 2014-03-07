var data={};
module.exports={
	get:function(key,cb) {
		if(key != undefined) 
			return data[key];
		else{
			return null;
		}
	},
	set:function(key,value,cb){
		if(key!=undefined){
			data[key]= value;
		}
	},
	clear:function(all,cb){
		if(all === true){
			data=null;
			data = {};
		}else if(Object.prototype.toString.call(all)==="[object String]"){
			delete data[all];
		}
	}
}