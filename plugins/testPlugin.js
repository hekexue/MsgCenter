var
inherit = require("../lib/inherit"),
	type = require('../lib/type');

var TestPlugin = {
	id: "testPlugin",
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
	beforeEmitData: function() {
		var len = arguments.length,
			callBack = arguments[len - 1],
			msgCenter = arguments[len - 2],
			io = arguments[len - 3],
			data = arguments[0];
		//send the data to all the user in the domain
		try {
			//some business logical codes gose here
			callBack(null, data);
		} catch (e) {
			callBack(e, null)
		}
	},
	afterConnected: function(data, clientCallback, msgCenter, socket) {
		if (data && data.domainId) {
			socket.join(data.domainId);
		}
	}
};
module.exports = TestPlugin;