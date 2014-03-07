/* File Created: 一月 23, 2014 */
define(["../lib/Runtime","../lib/Event","../lib/Type"],function (runtime,Event,Type) {
	function initSocket(callback) {
		var head = document.getElementsByTagName('head')[0],
		script = document.createElement('script');
		script.type = 'text/javascript';
		script.onload = script.onreadystatechange = function () {
			if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
				if (typeof callback === "function") {
					callback(io);
				}
				// Handle memory leak in IE
				script.onload = script.onreadystatechange = null;
			}
		};
		script.src = 'http://127.0.0.1:5000/socket.io/socket.io.js';
		head.appendChild(script);
	}
	var 
	socket = null,
	msgCenter = {
		url: '',
		init: function (config) {
			var cfg = config || {};
			this._super(cfg);
			this.msgPlugins = cfg.msgPlugins || {};
			this.msgPlugins.length = (cfg.msgPlugins && cfg.msgPlugins.length) || 0;
			this.connected = false;
			this.serverPluginInited = false;
			this.token = cfg.token;
			this.regPlugin = true;
		},
		reg: function (data) {
			if (data) {
				if (!data.id) { throw new Error("id是必须的"); }
				if (!data.handlers) { throw new Error("handler参数是必须的"); }
				if (!this.msgPlugins[data.id]) {
					this.msgPlugins[data.id] = data;
					this.msgPlugins.length += 1;
				}
			}
			return this;
		},
		_getUserInfo: function () {
			var token = this.token,
			uinfo = runtime.get("memberInfo");
			return {
				et: token,
				uid: uinfo.id,
				domainId: uinfo.domain_id
			}
		},
		_setUpClients: function (socket, svrPlugins) {
			var me = this;
			//监听事件
			function tmpHandler(svrPlg, socket) {
				return function () {
					var args = Array.prototype.slice.call(arguments, 0),
						pubs = svrPlg.publish,
						handler = function () {
						},
						client = me.msgPlugins[svrPlg.id];
					//pass the socket to the plugin
					args.push(socket);
					//pass the messageCenter to the plugin
					args.push(me);
					if (client) {
						for (var i in pubs) {
							handler = client.subscribe[pubs[i]];
							if (Type.isFunction(handler)) {
								setTimeout(function () {
									handler.apply(client, args);
								}, 0);
							}
						}
					}
				}
			}

			if (Type.isArray(svrPlugins)) {
				var svrPlg = null, i = 0,
					c = null;
				for (; svrPlg = svrPlugins[i]; i++) {
					socket.on(svrPlg.emitName, tmpHandler(svrPlg, socket));
				}
			}
		},

		connect: function (url) {
			if (!this.connected) {
				this.connected = true;
				//开始连接socket.io
				var me = this,
				callback = function (io) {
					//连接服务器
					var skt = io.connect(url ? url : me.url);

					skt.socket.on('connect', function (data) {
						//get user information
						var regInfo = me._getUserInfo();
						if (this.regPlugin) {
							this.regPlugin = false;
						}
						regInfo.regPlugin = me.regPlugin;
						skt.emit("clientRegRequest", regInfo, function (res) {						
							//判断服务端的插件是否初始化过
							if (res && me.serverPluginInited === false) {
								me.serverPluginInited = true;
								//如果没有初始化过，则开始初始化
								var svrPlugs = res;
								//监听服务端插件的emitName，在对应事件中，分发事件
								me._setUpClients(skt, svrPlugs);
							}
							//me._setUpClients(skt);
						});
					});

					skt.on('disconnect', function () {						
					});
					skt.on('reconnect', function () {
					});
					skt.on('reconnecting', function (nextRetry) {
					});
					skt.on('reconnect_failed', function () {
						var regInfo = me._getUserInfo();
						skt.emit("logout", regInfo, function (res) {
							alert("stop webSocket")
						});
					});
					socket = skt;
				}
				initSocket(callback);
			}
		},
		send: function (msg) {
			if (!this.connected) {
				throw new Error("发送之前请先调用connect方法连接服务器");
			}
			if (typeof msg === "string")
				socket.send(msg);
			else if (Object.prototype.toString.call(msg) === "[object Object]") {
				var evt = msg.event, data = msg.msg, id=msg.id;
				if(typeof id ==="string"){
					evt = id + evt;
				}
			 	socket.emit(evt, data);
			}
		}
	},
	MsgCenter = Event.extend(msgCenter);
	var instance = null;
	return {
		getInstance: function (config) {
			if (!instance) {
				instance = new MsgCenter(config);
			} 
			return instance;
		}
	};
})