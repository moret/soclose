soclose
=======
word to word distance system

## Setup

### Requirements
- Node.js 7+
- Recommended: Yarn 0.27+

### Getting ready to run
Just:
```
yarn
```
And it's ready.

## Developing

### Running tests

```
yarn test
```

## Running

### NIY

### Benchmark

Using the third-party
[fast-levenshtein](https://github.com/hiddentao/fast-levenshtein)
to calculate the distance of one word against 450k+ english words - thanks to
[english-words](https://github.com/dwyl/english-words) for the words dictionary
- all in memory and in one process takes about 17s:
```
$ yarn benchmark
(...)
comparing 'banana' to 466545 words
(...)
elapsed time: 16991ms
words up to three changes away from "banana": 2199
words up to six changes away from "banana": 138295
words up to nine changes away from "banana": 326634
```
