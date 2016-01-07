import _ from 'lodash';

// TODO support all mongodb update operators
// TODO invariant checks

function shallowCopy(t) {
	if (Array.isArray(t)) {
		return [...t];
	} else if (t && typeof t === 'object') {
		return Object.assign(new t.constructor(), t);
	}
	return t;
}

function expectObject(t) {
	if (!_.isObject(t)) {
		throw new Error('expected object');
	}
	return t;
}

function expectArray(t) {
	if (!_.isArray(t)) {
		throw new Error('expected array');
	}
	return t;
}

export function applyPatch(obj, patch) {
	let result = obj;
	let changed = false;

	function copy() {
		if (changed) return;
		changed = true;
		result = { ...obj };
	}

	function findTarget(key, mutable) {
		if (key.indexOf('.') < 0) {
			if (mutable) {
				copy();
				result[key] = shallowCopy(result[key]);
			}
			return { target: result, key };
		}
		const path = key.split('.');
		if (mutable) copy();
		let target = result;
		for (let i = 0; i < path.length - 1; i++) {
			const p = path[i];
			let t = _.get(target, p, undefined);
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
		return { target, key: path[path.length - 1] };
	}

	function hasPath(key) {
		return _.get(obj, key, undefined) !== undefined;
	}

	function setPath(k, v) {
		const { target, key } = findTarget(k, true);
		target[key] = v;
	}

	function isNotChanged(k, v) {
		const { target, key } = findTarget(k, false);
		return target[key] === v;
	}

	function set(k, v) {
		if (isNotChanged(k, v)) return;
		if (_.isObject(v)) {
			if (hasPath(k)) {
				const { target, key } = findTarget(k, false);
				const oldval = target[key];
				const newval = applyPatch(oldval, v);
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
		const { target, key } = findTarget(k, true);
		target[key] = target[key] + v;
	}

	function dec(k, v) {
		const { target, key } = findTarget(k, true);
		target[key] = target[key] - v;
	}

	function mul(k, v) {
		const { target, key } = findTarget(k, true);
		target[key] = target[key] * v;
	}

	function getArray(k) {
		const { target, key } = findTarget(k, true);
		const array = [...expectArray(target[key])];
		target[key] = array;
		return array;
	}

	function push(k, v) {
		const array = getArray(k);
		array.push(v);
	}

	function pop(k, v) {
		const array = getArray(k);
		if (v < 0) array.shift();
		else array.pop(v);
	}

	function splice(k, v) {
		const array = getArray(k);
		array.splice(v, 1);
	}

	_.forOwn(patch, (val, key) => {
		if (key.charAt(0) === '$') {
			switch (key) {
			case '$set':
				_.forOwn(val, (v, k) => set(k, v));
				break;
			case '$inc':
				_.forOwn(val, (v, k) => {
					if (v === 0) return;
					inc(k, v);
				});
				break;
			case '$mul':
				_.forOwn(val, (v, k) => {
					mul(k, v);
				});
				break;
			case '$dec':
				_.forOwn(val, (v, k) => {
					if (v === 0) return;
					dec(k, v);
				});
				break;
			case '$push':
				_.forOwn(val, (v, k) => {
					push(k, v);
				});
				break;
			case '$pop':
				_.forOwn(val, (v, k) => {
					pop(k, v);
				});
				break;
			case '$splice':
				_.forOwn(val, (v, k) => {
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

export default applyPatch;
