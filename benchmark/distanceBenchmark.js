import fs from 'fs';
import distance from '../src/distance';

// Thanks to https://github.com/dwyl/english-words
const englishWords = fs
  .readFileSync(`${__dirname}/englishWords.txt`, 'utf-8')
  .split('\n');

const englishWordsLength = englishWords.length;

console.log(`comparing 'banana' to ${englishWordsLength} words`);

const start = new Date();
console.log(`start: ${start}`);

const word = 'banana';
let underThree = 0;
let underSix = 0;
let underNine = 0;

for (let i = 0; i < englishWordsLength; i++) {
  if (i % 1000 == 0) {
    process.stdout.write(`words procesed: ${i}/${englishWordsLength}\r`);
  }
  const calculatedDistance = distance(word, englishWords[i]);
  if (calculatedDistance <= 3) {
    underThree++;
  }
  if (calculatedDistance <= 6) {
    underSix++;
  }
  if (calculatedDistance <= 9) {
    underNine++;
  }
}

const end = new Date();
console.log(`end: ${end}`);

console.log(`elapsed time: ${end - start}ms`);
console.log(`words up to three changes away from "${word}": ${underThree}`);
console.log(`words up to six changes away from "${word}": ${underSix}`);
console.log(`words up to nine changes away from "${word}": ${underNine}`);
