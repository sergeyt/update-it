import _ from 'lodash';

// TODO support all mongodb update operators
// TODO invariant checks

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

	function findTarget(key) {
		if (key.indexOf('.') < 0) {
			return { target: obj, key };
		}
		const path = key.split('.');
		if (path.length === 1) {
			return { target: obj, key };
		}
		const ps = path.slice(0, path.length - 1).join('.');
		if (_.get(obj, ps, undefined) === undefined) {
			copy();
		}
		let target = result;
		for (let i = 0; i < path.length - 1; i++) {
			const p = path[i];
			if (target.hasOwnProperty(p)) {
				target = expectObject(target[p]);
				continue;
			}
			target = target[p] = {};
		}
		return { target, key: path[path.length - 1] };
	}

	function isNotChanged(k, v) {
		const { target, key } = findTarget(k);
		return target[key] === v;
	}

	function set(k, v) {
		if (isNotChanged(k, v)) return;
		copy();
		const { target, key } = findTarget(k);
		if (_.isObject(v)) {
			if (target.hasOwnProperty(key)) {
				const oldval = target[key];
				const newval = applyPatch(oldval, v);
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
		const { target, key } = findTarget(k);
		target[key] = target[key] + v;
	}

	function dec(k, v) {
		copy();
		const { target, key } = findTarget(k);
		target[key] = target[key] - v;
	}

	function mul(k, v) {
		copy();
		const { target, key } = findTarget(k);
		target[key] = target[key] * v;
	}

	function getArray(k) {
		copy();
		const { target, key } = findTarget(k);
		return expectArray(target[key]);
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

	_.forOwn(patch, (key, val) => {
		if (key.charAt(0) === '$') {
			switch (key) {
			case '$set':
				_.forOwn(val, set);
				break;
			case '$inc':
				_.forOwn(val, (k, v) => {
					if (v === 0) return;
					inc(k, v);
				});
				break;
			case '$mul':
				_.forOwn(val, (k, v) => {
					mul(k, v);
				});
				break;
			case '$dec':
				_.forOwn(val, (k, v) => {
					if (v === 0) return;
					dec(k, v);
				});
				break;
			case '$push':
				_.forOwn(val, (k, v) => {
					push(k, v);
				});
				break;
			case '$pop':
				_.forOwn(val, (k, v) => {
					pop(k, v);
				});
				break;
			case '$splice':
				_.forOwn(val, (k, v) => {
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
