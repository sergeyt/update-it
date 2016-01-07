'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.applyPatch = applyPatch;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO support all mongodb update operators
// TODO invariant checks

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

	function findTarget(key) {
		if (key.indexOf('.') < 0) {
			return { target: obj, key: key };
		}
		var path = key.split('.');
		if (path.length === 1) {
			return { target: obj, key: key };
		}
		var ps = path.slice(0, path.length - 1).join('.');
		if (_lodash2.default.get(obj, ps, undefined) === undefined) {
			copy();
		}
		var target = result;
		for (var i = 0; i < path.length - 1; i++) {
			var p = path[i];
			if (target.hasOwnProperty(p)) {
				target = expectObject(target[p]);
				continue;
			}
			target = target[p] = {};
		}
		return { target: target, key: path[path.length - 1] };
	}

	function isNotChanged(k, v) {
		var _findTarget = findTarget(k);

		var target = _findTarget.target;
		var key = _findTarget.key;

		return target[key] === v;
	}

	function set(k, v) {
		if (isNotChanged(k, v)) return;
		copy();

		var _findTarget2 = findTarget(k);

		var target = _findTarget2.target;
		var key = _findTarget2.key;

		if (_lodash2.default.isObject(v)) {
			if (target.hasOwnProperty(key)) {
				var oldval = target[key];
				var newval = applyPatch(oldval, v);
				if (oldval === newval) return;
				copy();
				target[key] = newval;
			} else {
				copy();
				result[key] = applyPatch({}, v);
			}
		} else {
			target[key] = v;
		}
	}

	function inc(k, v) {
		copy();

		var _findTarget3 = findTarget(k);

		var target = _findTarget3.target;
		var key = _findTarget3.key;

		target[key] = target[key] + v;
	}

	function dec(k, v) {
		copy();

		var _findTarget4 = findTarget(k);

		var target = _findTarget4.target;
		var key = _findTarget4.key;

		target[key] = target[key] - v;
	}

	function mul(k, v) {
		copy();

		var _findTarget5 = findTarget(k);

		var target = _findTarget5.target;
		var key = _findTarget5.key;

		target[key] = target[key] * v;
	}

	function getArray(k) {
		copy();

		var _findTarget6 = findTarget(k);

		var target = _findTarget6.target;
		var key = _findTarget6.key;

		return expectArray(target[key]);
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

	_lodash2.default.forOwn(patch, function (key, val) {
		if (key.charAt(0) === '$') {
			switch (key) {
				case '$set':
					_lodash2.default.forOwn(val, set);
					break;
				case '$inc':
					_lodash2.default.forOwn(val, function (k, v) {
						if (v === 0) return;
						inc(k, v);
					});
					break;
				case '$mul':
					_lodash2.default.forOwn(val, function (k, v) {
						mul(k, v);
					});
					break;
				case '$dec':
					_lodash2.default.forOwn(val, function (k, v) {
						if (v === 0) return;
						dec(k, v);
					});
					break;
				case '$push':
					_lodash2.default.forOwn(val, function (k, v) {
						push(k, v);
					});
					break;
				case '$pop':
					_lodash2.default.forOwn(val, function (k, v) {
						pop(k, v);
					});
					break;
				case '$splice':
					_lodash2.default.forOwn(val, function (k, v) {
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