import levenshtein from 'fast-levenshtein';

export default function distance(wordA, wordB) {
  return levenshtein.get(wordA, wordB, { useCollator: true });
}
