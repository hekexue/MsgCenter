var extend = require("./extend-inner"),
type = require("./type");

function inherit(subClass, baseClass, overWrites) {
	type.isFunction(subClass) ? "" : (subClass = function() {});
	if (type.isFunction(baseClass)) {
		function F() {}
		F.prototype = baseClass.prototype;
		subClass.prototype = new f();
		subClass.prototype.constructor = subClass;
	}
	if (type.isObject(baseClass)) {
		var subClass = extend.extend(baseClass, overWrites, true);
	}
	return subClass;
}

module.exports = inherit;