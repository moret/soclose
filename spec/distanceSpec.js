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

describe('invalid inputs', () => {
  it('rejects undefined, null or non-string parameters', () => {
    [
      null,
      undefined,
      true,
      false,
      12345,
      { banana: 'abacate' },
      [ 'b', 'a', 'n', 'a', 'n', 'a' ],
    ].forEach(invalidInput => {
      expect(() => distance('banana', invalidInput)).toThrowError(TypeError, 'Only strings accepted');
      expect(() => distance(invalidInput, 'abacate')).toThrowError(TypeError, 'Only strings accepted');
    });
  });

  it('rejects words too large', () => {
    // https://en.wikipedia.org/wiki/Taumatawhakatangihangakoauauotamateaturipukakapikimaungahoronukupokaiwhenuakitanatahu
    const longWord = 'Taumatawhakatangihangakoauauotamateaturipukakapikimaungahoronukupokaiwhenuakitanatahu';
    expect(() => distance(longWord, 'abacate')).toThrowError(TypeError, 'Only strings with 50 characters or less accepted');
    expect(() => distance('banana', longWord)).toThrowError(TypeError, 'Only strings with 50 characters or less accepted');
  });
})

describe('latin characters', () => {
  it('does not count accents, tildes and cedillas as different from their ascii collations', () => {
    expect(distance('açaí', 'acai')).toBe(0);
    expect(distance('mamão', 'mamao')).toBe(0);
  });

  it('handles all accents, tildes and cedillas as their ascii collations', () => {
    expect(distance('áàâãä', 'aaaaa')).toBe(0);
    expect(distance('éèêẽë', 'eeeee')).toBe(0);
    expect(distance('íìîĩï', 'iiiii')).toBe(0);
    expect(distance('óòôõö', 'ooooo')).toBe(0);
    expect(distance('úùûũü', 'uuuuu')).toBe(0);
    expect(distance('ñỹç', 'nyc')).toBe(0);
  });

  it('counts accent distances as one each just like any other letter', () => {
    expect(distance('caçador', 'catador')).toBe(1);
    expect(distance('pará', 'pare')).toBe(1);
  });
});
