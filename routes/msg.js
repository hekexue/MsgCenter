
function securityCheck(req) {
	return true;
}

module.exports = {
	msgHandler: function(req, res, next, messageCenter) {
		if (securityCheck(req)) {
			// var data = {
			// 	pluginId: "",
			// 	type: "",//0:all,1:partial
			// 	title: "",
			// 	receivers: [{
			// 		id: "",
			// 		type: "" //1:user,2:dept,3:group
			// 	}],
			// 	content: "",
			// 	extraData: {}
			// }
			try {
				var data = JSON.parse(req.param("data")),
					pluginId = "";				
				if (data) {
					pluginId = data.pluginId;
					messageCenter.emit(pluginId,  data);
				}
				res.writeHead(200,{"Content-Type": "text/plain"});
				res.end("ok");
				return;
			} catch (e) {
				console.log(e);
				res.writeHead(500,{"Content-Type": "text/plain"})
				res.end("internal server error");
				return;
			}
		}else{
			res.send(404,{"Content-Type": "text/plain"});
			res.end("page not found");
			return;
		}
	}
}