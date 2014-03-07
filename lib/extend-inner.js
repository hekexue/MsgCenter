var type = require("./type"),
	clone = require("clone"),
	ext = require("extend");
module.exports = {
	extend: function(original, extend, overWrite) {
		if (type.isObject(original) && type.isObject(extend)) {
			for (var i in extend) {
				overWrite ? (original[i] = ext.extend(true, original[i], extend[i])): ((type.isUndefined(original[i]) || type.isNull(original[i])) && (original[i] = clone(extend[i])))
				}
			}
			return original;
		}
	}