import distance from '../src/distance';

it('handles easy known distance cases', () => {
  expect(distance('banana', 'abacate')).toBe(4);
  expect(distance('kitten', 'sitting')).toBe(3);
});

it('ignores caps and lower case differences', () => {
  expect(distance('BANANA', 'abacate')).toBe(4);
  expect(distance('KITTEN', 'sitting')).toBe(3);
});

describe('corner cases', () => {
  it('handles comparison to an empty word', () => {
    expect(distance('banana', '')).toBe(6);
    expect(distance('abacate', '')).toBe(7);
  });

  it('handles comparison from an empty word', () => {
    expect(distance('', 'banana')).toBe(6);
    expect(distance('', 'abacate')).toBe(7);
  });

  it('handles comparison to the same word', () => {
    expect(distance('banana', 'banana')).toBe(0);
    expect(distance('abacate', 'abacate')).toBe(0);
  });
});
