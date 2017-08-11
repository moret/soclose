import levenshtein from 'fast-levenshtein';

export default function distance(wordA, wordB) {
  if (typeof wordA != 'string' || typeof wordB != 'string') {
    throw new TypeError('Only strings accepted');
  }
  if (wordA.length > 50 || wordB.length > 50) {
    throw new TypeError('Only strings with 50 characters or less accepted');
  }
  return levenshtein.get(wordA, wordB, { useCollator: true });
}
