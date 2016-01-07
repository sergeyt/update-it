import { applyPatch } from '../src/patch';
import freeze from 'deep-freeze-strict';
import expect from 'expect.js';

describe('applyPatch', () => {
	it('should implicitly set property', () => {
		const obj = freeze({ val: 'a' });
		const result = applyPatch(obj, { val: 'b' });
		expect(result.val).to.eql('b');
	});

	it('should not change object if value is not changed', () => {
		const obj = freeze({ val: 'a' });
		const result = applyPatch(obj, { val: 'a' });
		expect(result === obj).to.be.ok();
	});

	it('$unknown operator is a property', () => {
		const obj = freeze({ $unknown: 'a' });
		const result = applyPatch(obj, { $unknown: 'b' });
		expect(result.$unknown).to.eql('b');
	});

	it('$set operator', () => {
		const obj = freeze({ val: 'a' });
		const result = applyPatch(obj, { $set: { val: 'b' } });
		expect(result.val).to.eql('b');
	});

	it('$inc operator', () => {
		const obj = freeze({ val: 11 });
		const result = applyPatch(obj, { $inc: { val: 11 } });
		expect(result.val).to.eql(22);
	});

	it('$dec operator', () => {
		const obj = freeze({ val: 11 });
		const result = applyPatch(obj, { $dec: { val: 4 } });
		expect(result.val).to.eql(7);
	});

	it('$inc 0 has no effect', () => {
		const obj = freeze({ val: 11 });
		const result = applyPatch(obj, { $inc: { val: 0 } });
		expect(result === obj).to.be.ok();
	});

	it('$dec 0 has no effect', () => {
		const obj = freeze({ val: 11 });
		const result = applyPatch(obj, { $dec: { val: 0 } });
		expect(result === obj).to.be.ok();
	});

	it('$mul operator', () => {
		const obj = freeze({ val: 11 });
		const result = applyPatch(obj, { $mul: { val: 3 } });
		expect(result.val).to.eql(33);
	});

	it('$push operator', () => {
		const obj = freeze({ vals: [11] });
		const result = applyPatch(obj, { $push: { vals: 12 } });
		expect(result.vals).to.eql([11, 12]);
	});

	it('$pop 1', () => {
		const obj = freeze({ vals: [11, 12] });
		const result = applyPatch(obj, { $pop: { vals: 1 } });
		expect(result.vals).to.eql([11]);
	});

	it('$pop -1', () => {
		const obj = freeze({ vals: [11, 12] });
		const result = applyPatch(obj, { $pop: { vals: -1 } });
		expect(result.vals).to.eql([12]);
	});

	it('$splice operator', () => {
		const obj = freeze({ vals: [11, 12, 13] });
		const result = applyPatch(obj, { $splice: { vals: 1 } });
		expect(result.vals).to.eql([11, 13]);
	});

	it('$push not array', () => {
		const obj = freeze({ vals: 'a' });
		const fn = () => applyPatch(obj, { $push: { vals: 12 } });
		expect(fn).to.throwError();
	});

	it('set nested', () => {
		const obj = freeze({ data: { val: 'a' } });
		const result = applyPatch(obj, { data: { val: 'b' } });
		expect(result.data.val).to.eql('b');
	});

	it('set nested without changes', () => {
		const obj = freeze({ data: { val: 'a' } });
		const result = applyPatch(obj, { data: { val: 'a' } });
		expect(result === obj).to.be.ok();
	});

	it('set new nested object', () => {
		const obj = freeze({});
		const result = applyPatch(obj, { data: { val: 'b' } });
		expect(result.data.val).to.eql('b');
	});

	it('set path', () => {
		const obj = freeze({ data: { val: 'a' } });
		const result = applyPatch(obj, { 'data.val': 'b' });
		expect(result.data.val).to.eql('b');
	});
});
