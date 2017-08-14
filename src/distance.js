const collator = Intl.Collator('generic', { sensitivity: 'base' });

export default function distance(wordA, wordB) {
  if (typeof wordA != 'string' || typeof wordB != 'string') {
    throw new TypeError('Only strings accepted');
  }
  if (wordA.length > 50 || wordB.length > 50) {
    throw new TypeError('Only strings with 50 characters or less accepted');
  }
  const wordArrayA = wordA.toLowerCase().split('');
  const wordArrayB = wordB.toLowerCase().split('');
  const lengthA = wordArrayA.length;
  const lengthB = wordArrayB.length;
  const matrix = [];
  for (let i = 0; i < lengthA + 1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j < lengthB + 1; j++) {
    matrix[0][j] = j;
  }
  for (let i = 0; i < lengthA; i++) {
    for (let j = 0; j < lengthB; j++) {
      const compared = collator.compare(
        wordArrayA[i],
        wordArrayB[j]
      );
      const cost = compared != 0 ? 1 : 0;
      matrix[i + 1][j + 1] = Math.min(
        matrix[i][j + 1] + 1,
        matrix[i + 1][j] + 1,
        matrix[i][j] + cost,
      );
    }
  }

  return matrix[lengthA][lengthB];
}
