define(["../common/ClassBase","./Type"],function (Class, util) {
	var event = {
			init:function(){				
				this.events = {};
			},
			on: function (name, fn) {
				if (!this.events) {
					this.events = {};
				}
				var events = this.events;
				if (!events[name]) {
					events[name] = [];
				}
				util.isFunction(fn) && events[name].push(fn);

				//events = null;
			},
			un: function (name) {
				if (!this.events || !util.isArray(this.events[name])) {
					return false;
				}
				this.events[name] = [];
			},
			fire: function (name) {
				if (this.events) {
					var fn = null,
						len = 0,
						fns = this.events[name],
						args = Array.prototype.slice.apply(arguments,1),
						outer = function (handler) {
							return function () {
								handler.apply(null,args);
							}
						};
					util.isArray(fns) && (len = fns.length);
					for (var i = 0; i < len; i++) {
						fn = fns[i];
						setTimeout(outer(fn), 0);
					}
				}
			},
			clearEvents: function () {
				this.events = null;
				this.events = {};
			}
		},
		Event = Class.extend(event);
	
	return Event;
})