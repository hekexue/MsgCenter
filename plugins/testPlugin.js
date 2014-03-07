var
	inherit = require("../lib/inherit"),
	type = require('../lib/type');

var TestPlugin = {
	id:"testPlugin",
	subscribe: [{
		listen: "test",
		handler: function(msg, messageCenter, socket) {
			console.log("test" + msg);
		}
	}, {
		listen: "test2",
		handler: function(msg, messageCenter, socket) {
			console.log("test" + msg);
		}
	}],
	publish: ["testPushData"],
	push:function(){
		
	}
};
module.exports = TestPlugin;