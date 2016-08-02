'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.applyPatch = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.updateObject = updateObject;
exports.updateArray = updateArray;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _patch = require('./patch');

var _patch2 = _interopRequireDefault(_patch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

exports.applyPatch = _patch2.default;

/* eslint-disable no-use-before-define */

function updateObjectImpl(obj, update, isSelected) {
	if (isSelected(obj)) {
		return update(obj);
	}
	var result = obj;
	var changed = false;
	_lodash2.default.forOwn(obj, function (val, key) {
		var newval = updateValue(val, update, isSelected);
		if (newval === val) {
			return;
		}
		if (!changed) {
			result = _extends({}, obj);
			changed = true;
		}
		result[key] = newval;
	});
	return result;
}

function makeUpdateFn(update) {
	if (_lodash2.default.isFunction(update)) {
		return update;
	}
	return function (target) {
		return (0, _patch2.default)(target, update);
	};
}

function selectAny() {
	return true;
}

function updateObject(obj, update) {
	var isSelected = arguments.length <= 2 || arguments[2] === undefined ? selectAny : arguments[2];

	return updateObjectImpl(obj, makeUpdateFn(update), isSelected);
}

exports.default = updateObject;


function updateValue(val, update, isSelected) {
	if (_lodash2.default.isArray(val)) {
		return updateArrayImpl(val, update, isSelected);
	}
	if (_lodash2.default.isObject(val)) {
		return updateObjectImpl(val, update, isSelected);
	}
	return val;
}

function updateArrayImpl(array, update, isSelected) {
	var copied = false;
	var result = array;
	array.forEach(function (t, i) {
		var t2 = updateObjectImpl(t, update, isSelected);
		if (t2 === t) {
			return;
		}
		if (!copied) {
			result = [].concat(_toConsumableArray(array));
			copied = true;
		}
		result[i] = t2;
	});
	return result;
}

function updateArray(array, update) {
	var isSelected = arguments.length <= 2 || arguments[2] === undefined ? selectAny : arguments[2];

	return updateArrayImpl(array, makeUpdateFn(update), isSelected);
}

/* eslint-enable */