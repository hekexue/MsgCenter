/**
 * Module dependencies.
 */

var express = require('express');
var appEnv = require("./config/environment");
var msg = require('./routes/msg');
var http = require('http');
var path = require('path');
var socket = require('socket.io');
var app = express();
var MessageCenter = require("./messageCenter/messageCenter");
var msgCenter = MessageCenter.getInstance();
var testPlugin = require("./plugins/testPlugin");


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


app.post("/msg", function(req, res, next) {
	msg.msgHandler(req, res, next, msgCenter);
})
// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

var server = http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});


var io = socket.listen(server);
/*if the service is supporited by multi-porcess or multi-server,than use redis client as data store*/
if (appEnv.multiProcess) {
	var RedisStore = require('socket.io/lib/stores/redis'),
		redis = require('socket.io/node_modules/redis'),
		pub = redis.createClient(appEnv.redisPort, appEnv.redisHost),
		sub = redis.createClient(appEnv.redisPort, appEnv.redisHost),
		client = redis.createClient(appEnv.redisPort, appEnv.redisHost);
	io.set('store', new RedisStore({
		redisPub: pub,
		redisSub: sub,
		redisClient: client
	}));
}


msgCenter.reg([testPlugin], io);
io.sockets.on("connection", function(socket) {
	msgCenter.initService({
		socket: socket
	});
});