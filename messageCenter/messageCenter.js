/*response to mantain the websocket links of the clients*/
var redis = require('redis'),
	appEnv = require("../config/environment"),	
	type = require("../lib/type"),
	EventEmitter = require('events').EventEmitter,
	instance = null;


function MessageCenter() {
	this.services = [];
	this.plugins = [];
	this.pluginRegisted = false;
	this.store = redis.createClient(appEnv.redisPort, appEnv.redisHost);
	this.watchIntervalId = 0;
}


//define self mathods 
MessageCenter.prototype = {
	constructor: MessageCenter,
	svrEventPrefix: "ServerPush",
	/**
	 * initiate the msg center sockets
	 * @param  {[object Object]} cfg current socket and server-side-plugins
	 * @return {[type]}     [description]
	 */
	initService: function(cfg) {
		if (!cfg || !cfg.socket) return false;
		var socket = cfg.socket,
			plugins = this.plugins;
		this.initEvents(socket);
		if (type.isArray(plugins)) {
			this.initLinsteners(plugins, socket);
		}
	},
	/**
	 * setup handlers for server-side-plugins; used for  private only
	 * @param  {Object} plugin    the plugin registed in the messageCenter
	 * @param  {Array} listeners listeners of the plugin
	 * @param  {Object} socket    current socket
	 * @return {[type]}           [description]
	 */
	_serverSideHandlers: function(plugin, listeners, socket) {
		var listener = function() {};
		var me = this;
		for (var j = 0, len = listeners.length; j < len; j++) {
			listener = listeners[j];
			if (listener && listener.listen) {
				socket.on(plugin.id + listener.listen, (function(listener) {
					return function() {
						var args = Array.prototype.slice.call(arguments, 0);
						args.push(me);
						args.push(socket);
						handler = listener.handler || handler;
						if (type.isFunction(handler)) {
							handler.apply(listener.scope || listener, args);
						}
					}
				})(listener));
			}
		}
	},
	/**
	 * setup server-side-plugin
	 * @param  {Array} plugins server-side-plugins
	 * @param  {object} socket  current socket
	 * @return {[type]}         [description]
	 */
	initLinsteners: function(plugins, socket) {
		var me = this,
			i = 0,
			listener = null,
			handler = null,
			listeners = [],
			plugin = null,
			len = plugins.length;
		for (; i < len; i++) {
			plugin = plugins[i],
			listeners = plugin.listeners;
			//regist the server side plugins whitch need to listen to the client side events
			if (!listeners) {
				continue;
			}
			this._serverSideHandlers(plugin, listeners, socket);
		}
	},
	/**
	 * initiate default events of the messageCenter
	 * @param  {[type]} socket [description]
	 * @return {[type]}        [description]
	 */
	initEvents: function(socket) {
		var me = this;
		socket.on("clientRegRequest", function() {
			var args = Array.prototype.slice.call(arguments, 0);
			args.push(socket);
			me.clientRegRequest.apply(me, args);
		});
		socket.on("disconnect", function() {
			var data = arguments[0];
			if (data && data.bid) {
				me.store.srem(data.bid, socket.id);
			}
		});
	},

	/**
	 * Regist Client and send the server-side-plugins back
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */
	clientRegRequest: function(data) {
		var socket = arguments[arguments.length - 1];
		//if client end send the user identifier, 
		//use it as the key to all the socket connections linked in by the same user;
		if (type.isObject(data) && data.bid) {
			this.store.sadd(data.bid, socket.id);
		}
		clientCallBack = arguments[arguments.length - 2];
		if (type.isFunction(clientCallBack)) {
			clientCallBack(this.plugins);
		}
	},
	/**
	 * reg server-side-plugins used for server push
	 * @return {[type]} [description]
	 */
	reg: function(plugins, io) {
		if (!this.pluginRegisted && type.isArray(plugins)) {
			this.pluginRegisted = true;
			this.io = io;
			var me = this,
				len = plugins.length,
				id = "",
				i = 0,
				plugin = null,
				handler = function() {};
			this.plugins = plugins;
			for (var i = 0; i < len; i++) {
				plugin = plugins[i];
				plugin.emitName = me.svrEventPrefix + plugin.id;
				id = plugin.id;
				//regist the events that server-side-plugins need to handle
				this._initPlugins(plugin, io);
			};
		}
	},
	/**
	 * initate server-side-plugins
	 * @param  {object} plugin  server-side-plugin
	 * @param  {[type]} io     [description]
	 * @return {[type]}        [description]
	 */
	_initPlugins: function(plugin, io) {
		var me = this,
			plg = plugin;
		me.on(plg.id, function() {
			if (type.isFunction(plg.beforeEmitData)) {
				var args = Array.prototype.slice.call(arguments, 0),
					callBack = function(err, data) {
						me.send(null, data, plg);
					}
				args.push(io);
				args.push(me);
				args.push(callBack);
				plg.beforeEmitData.apply(plg, args);
			} else {
				me.send(null, data, plg);
			}
		})
	},
	send: function(err, data) {
		if (type.isError(err)) {
			console.log(err);
			return false;
		}
		if (type.isObject(data) && type.isArray(data.receivers)) {
			var me = this,
				args = [],
				skt = null,
				i = j = 0,
				len = data.receivers.length,
				io = me.io,
				plugin = arguments[2],
				userSkts = [];
			if (plugin && type.isFunction(plugin.push)) {
				args = Array.prototype.slice.call(arguments, 0);
				args.push(me);
				plugin.push.apply(plugin, args);
			} else {
				for (; i < len; i++) {
					receiver = data.receivers[i];
					//setTimeout(function() {
					switch (receiver.type * 1) {
						case 0:
							io.sockets. in (receiver.id).emit(plg.emitName, data);
							break; //receiver is the whole room
						case 1:
							//get user's socketid by business-logical id and send the data to all socket-clients this id holds
							me.store.smembers(receiver.id, function(err, userSkts) {
								if (type.isArray(userSkts) && userSkts.length > 0) {
									var jlen = userSkts.length,
										j = 0;
									for (; j < jlen; j++) {
										skt = io.sockets.socket(userSkts[j]);
										//emmit data
										skt.emmit(plg.emitName, data);
									}
								}
							});
							break; //receiver is a single client
						case 2:
							break;
						case 3:
							break;
						default:
							;
					}
					//}, 0);
				}
			}
			return true;
		}
		return false;
	}
}

//inherit from event
MessageCenter.prototype.__proto__ = EventEmitter.prototype;


module.exports = {
	getInstance: function() {
		if (type.isNull(instance)) {
			instance = new MessageCenter();
		}
		return instance;
	}
}
