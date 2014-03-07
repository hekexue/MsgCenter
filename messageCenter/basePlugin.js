function BasePlugin(){
	this.id="BasePlugin";
	this.emitName= "";
	this.publish = [];
}

BasePlugin.prototype={
	constructor:BasePlugin,
	subscribe: [{
		listen: "message",
		scope:null,
		handler: function(msg, messageCenter, socket) {
			console.log(msg);
		}
	}, {
		listen: "something else",
		handler: function(msg, messageCenter, socket) {
			console.log(msg);
		}
	}],
	publish: ["BasePluginDataPush"],
	//handler for the event which trigger has the same name as the plugin's id
	beforeEmitData: function() {
		var len = arguments.length,
			callBack = arguments[len - 1],
			msgCenter = arguments[len - 2],
			io = arguments[len - 2],
			data = arguments[0];
		//send the data to all the user in the domain
		try {
			//some business logical codes gose here
			callBack(null, data);
		} catch (e) {
			callBack(e, null)
		}
	},
	push:function(){

	}
}

module.exports= new BasePlugin();