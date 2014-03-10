var os = require('os-utils'),
	async = require("async");
module.exports = serverWatchPlugin = {
	id: "serverWatchPlugin",
	emitName: "",
	timers: {},
	listeners: [{
		listen: "startWatch",
		handler: function(msg, messageCenter, socket) {
			console.log(this.linsten);
			var me = serverWatchPlugin,
				interval = (msg && msg.interval) || 30000,
				timer = me.timers[socket.id],
				data = {};
			if (!timer) {
				timer = setInterval(function() {
					async.parallel([
						function(callback) {
							os.cpuUsage(function(data) {
								callback(null, data);
							});
						},
						function(callback) {
							os.getProcesses(0,function() {
								callback(null, data);
							})
						}
					], function(err, results) {
						if (err) {
							console.log(err);
						}
						var data = {
							loadAvg: os.loadavg(1),
							memoryTotal: os.totalmem(),
							memoryFree: os.freemem(),
							memoryUsageRate: 0,
							cpuUsage: results[0],
							processInfo: results[1],
							serverTime: (new Date()).toString()
						};
						data.memoryUsageRate = (data.memoryTotal - data.memoryFree) / data.memoryTotal;
						//send the data to client side
						socket.emit(me.emitName, data);
					});
				}, interval);
				me.timers[socket.id] = timer;
			}
		}
	}, {
		listen: "stopWatch",
		handler: function(msg, messageCenter, socket) {
			//console.log(this.linsten);
			var me = serverWatchPlugin,
				timer = me.timers[socket.id];
			if (typeof timer === "number") {
				clearInterval(timer);
			}
		}
	}],
	publish: ["onServerDataArrives"],
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
	}
}