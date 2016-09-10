import { updateObject } from '../src';
import expect from 'expect.js';

describe('updateObject', () => {
  it('simple test', () => {
    const result = updateObject({ val: 'a' }, { val: 'b' });
    expect(result.val).to.eql('b');
  });
});
