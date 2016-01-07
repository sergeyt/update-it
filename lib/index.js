'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.updateObject = updateObject;
exports.updateArray = updateArray;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// TODO support mongodb patch commands

function updateObject(obj, update, isSelected) {
	if (isSelected(obj)) {
		return update(obj);
	}
	var result = obj;
	var changed = false;
	_lodash2.default.forOwn(obj, function (val, key) {
		var newVal = updateValue(val, update, isSelected);
		if (newVal === val) {
			return;
		}
		if (!changed) {
			result = _extends({}, obj);
			changed = true;
		}
		result[key] = newVal;
	});
	return result;
}

function updateValue(val, update, isSelected) {
	if (_lodash2.default.isArray(val)) {
		return updateArray(val, update, isSelected);
	}
	if (_lodash2.default.isObject(val)) {
		return updateObject(val, update, isSelected);
	}
	return val;
}

function updateArray(array, update, isSelected) {
	var copied = false;
	var result = array;
	array.forEach(function (t, i) {
		var t2 = updateObject(t, update, isSelected);
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