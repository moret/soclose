import crypto from 'crypto';

it('works', () => {
  expect(true).toBe(true);
});

it('can use ES2015 imports', () => {
  expect(crypto).toBeDefined();
});
