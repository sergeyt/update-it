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

function updateArrayImpl(array, update, isSelected = selectAny) {
  return updateArray(array, t => updateObjectImpl(t, update, isSelected));
}

export function updateArray(array, updateItem) {
  let copied = false;
  let result = array;
  _.forEach(array, (t, i) => {
    const u = updateItem(t);
    if (u === t) {
      return;
    }
    if (!copied) {
      result = [...array];
      copied = true;
    }
    result[i] = u;
  });
  return result;
}

export function updateArrayDeep(array, update, isSelected = selectAny) {
  return updateArrayImpl(array, update, isSelected);
}

/* eslint-enable */

export function removeById(list, id) {
  return _.filter(list, t => t.id !== id);
}

export function replaceById(list, obj) {
  const i = _.findIndex(list, t => t.id === obj.id);
  if (i >= 0) {
    const result = (list || []).slice();
    result[i] = { ...result[i], ...obj };
    return result;
  }
  return list;
}
