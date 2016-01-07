import _ from 'lodash';
import applyPatch from './patch';

export { applyPatch };

/* eslint-disable no-use-before-define */

function updateObjectImpl(obj, update, isSelected) {
	if (isSelected(obj)) {
		return update(obj);
	}
	let result = obj;
	let changed = false;
	_.forOwn(obj, (val, key) => {
		const newval = updateValue(val, update, isSelected);
		if (newval === val) {
			return;
		}
		if (!changed) {
			result = { ...obj };
			changed = true;
		}
		result[key] = newval;
	});
	return result;
}

function makeUpdateFn(update) {
	if (_.isFunction(update)) {
		return update;
	}
	return target => applyPatch(target, update);
}

function selectAny() { return true; }

export function updateObject(obj, update, isSelected = selectAny) {
	return updateObjectImpl(obj, makeUpdateFn(update), isSelected);
}

export default updateObject;

function updateValue(val, update, isSelected) {
	if (_.isArray(val)) {
		return updateArrayImpl(val, update, isSelected);
	}
	if (_.isObject(val)) {
		return updateObjectImpl(val, update, isSelected);
	}
	return val;
}

function updateArrayImpl(array, update, isSelected) {
	let copied = false;
	let result = array;
	array.forEach((t, i) => {
		const t2 = updateObjectImpl(t, update, isSelected);
		if (t2 === t) {
			return;
		}
		if (!copied) {
			result = [...array];
			copied = true;
		}
		result[i] = t2;
	});
	return result;
}

export function updateArray(array, update, isSelected = selectAny) {
	return updateArrayImpl(array, makeUpdateFn(update), isSelected);
}

/* eslint-enable */
