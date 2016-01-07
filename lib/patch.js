'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.applyPatch = applyPatch;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// TODO support all mongodb update operators
// TODO invariant checks

function shallowCopy(t) {
	if (Array.isArray(t)) {
		return [].concat(_toConsumableArray(t));
	} else if (t && (typeof t === 'undefined' ? 'undefined' : _typeof(t)) === 'object') {
		return Object.assign(new t.constructor(), t);
	}
	return t;
}

function expectObject(t) {
	if (!_lodash2.default.isObject(t)) {
		throw new Error('expected object');
	}
	return t;
}

function expectArray(t) {
	if (!_lodash2.default.isArray(t)) {
		throw new Error('expected array');
	}
	return t;
}

function applyPatch(obj, patch) {
	var result = obj;
	var changed = false;

	function copy() {
		if (changed) return;
		changed = true;
		result = _extends({}, obj);
	}

	function findTarget(key, mutable) {
		if (key.indexOf('.') < 0) {
			if (mutable) {
				copy();
				result[key] = shallowCopy(result[key]);
			}
			return { target: result, key: key };
		}
		var path = key.split('.');
		if (mutable) copy();
		var target = result;
		for (var i = 0; i < path.length - 1; i++) {
			var p = path[i];
			var t = _lodash2.default.get(target, p, undefined);
			if (t === undefined) {
				if (!mutable) {
					return { target: {}, key: '' };
				}
				t = {};
				target[p] = t;
				target = t;
			} else {
				t = expectObject(t);
				if (mutable) {
					t = shallowCopy(t);
					target[p] = t;
				}
				target = t;
			}
		}
		return { target: target, key: path[path.length - 1] };
	}

	function hasPath(key) {
		return _lodash2.default.get(obj, key, undefined) !== undefined;
	}

	function setPath(k, v) {
		var _findTarget = findTarget(k, true);

		var target = _findTarget.target;
		var key = _findTarget.key;

		target[key] = v;
	}

	function isNotChanged(k, v) {
		var _findTarget2 = findTarget(k, false);

		var target = _findTarget2.target;
		var key = _findTarget2.key;

		return target[key] === v;
	}

	function set(k, v) {
		if (isNotChanged(k, v)) return;
		if (_lodash2.default.isObject(v)) {
			if (hasPath(k)) {
				var _findTarget3 = findTarget(k, false);

				var target = _findTarget3.target;
				var key = _findTarget3.key;

				var oldval = target[key];
				var newval = applyPatch(oldval, v);
				if (oldval === newval) return;
				setPath(k, newval);
			} else {
				setPath(k, applyPatch({}, v));
			}
		} else {
			setPath(k, v);
		}
	}

	function inc(k, v) {
		var _findTarget4 = findTarget(k, true);

		var target = _findTarget4.target;
		var key = _findTarget4.key;

		target[key] = target[key] + v;
	}

	function dec(k, v) {
		var _findTarget5 = findTarget(k, true);

		var target = _findTarget5.target;
		var key = _findTarget5.key;

		target[key] = target[key] - v;
	}

	function mul(k, v) {
		var _findTarget6 = findTarget(k, true);

		var target = _findTarget6.target;
		var key = _findTarget6.key;

		target[key] = target[key] * v;
	}

	function getArray(k) {
		var _findTarget7 = findTarget(k, true);

		var target = _findTarget7.target;
		var key = _findTarget7.key;

		var array = [].concat(_toConsumableArray(expectArray(target[key])));
		target[key] = array;
		return array;
	}

	function push(k, v) {
		var array = getArray(k);
		array.push(v);
	}

	function pop(k, v) {
		var array = getArray(k);
		if (v < 0) array.shift();else array.pop(v);
	}

	function splice(k, v) {
		var array = getArray(k);
		array.splice(v, 1);
	}

	_lodash2.default.forOwn(patch, function (val, key) {
		if (key.charAt(0) === '$') {
			switch (key) {
				case '$set':
					_lodash2.default.forOwn(val, function (v, k) {
						return set(k, v);
					});
					break;
				case '$inc':
					_lodash2.default.forOwn(val, function (v, k) {
						if (v === 0) return;
						inc(k, v);
					});
					break;
				case '$mul':
					_lodash2.default.forOwn(val, function (v, k) {
						mul(k, v);
					});
					break;
				case '$dec':
					_lodash2.default.forOwn(val, function (v, k) {
						if (v === 0) return;
						dec(k, v);
					});
					break;
				case '$push':
					_lodash2.default.forOwn(val, function (v, k) {
						push(k, v);
					});
					break;
				case '$pop':
					_lodash2.default.forOwn(val, function (v, k) {
						pop(k, v);
					});
					break;
				case '$splice':
					_lodash2.default.forOwn(val, function (v, k) {
						splice(k, v);
					});
					break;
				default:
					set(key, val);
					break;
			}
		} else {
			set(key, val);
		}
	});

	return result;
}

exports.default = applyPatch;