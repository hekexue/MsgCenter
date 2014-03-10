var cluster = require("cluster"),
	len = require("os").cpus().length,
	timeStamp = new Date(),
	queue = [],
	timeline = 6000,
	restartLimit = 10;

function tooFreequent() {
	var now = new Date(),
		tenth = 0,
		num = queue.length - 9;

	queue.push(now);
	tenth = queue[num];

	if (num <= 0) {
		return false;
	} else {
		if (tenth - now > 6000) {
			return false;
		}
		return true;
	}
}

cluster.setupMaster({
	exec: "app.js"
});

for (var i = 0; i < len; i++) {
	cluster.fork();
};



cluster.on("exit", function(worker, code, signal) {
	console.log("worker " + worker.process.pid + "dead");
	if (tooFreequent()) {
		setTimeout(function() {
			if (cluster.workers.length < len) {
				cluster.fork();
			}
		}, 6000)
	} else {
		cluster.fork();
	}
});