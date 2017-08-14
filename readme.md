soclose
=======
word to word distance system

## Setup

### Requirements
- Node.js 7+
- Recommended: Yarn 0.27+
- MongoDB 3.2+;
- Redis 3+;

### About UTF-8

Paths must be utf-8 and urlencoded. Ex. /word/açaí becomes with cURL:
```
curl 'localhost:3000/words/a%C3%A7a%C3%AD'
```
Try someone like https://insomnia.rest/ instead of cURL for non-ascii words.

### Get ready

```
yarn
```

## Development

### Test

```
yarn test
```

### Start and auto-reload on changes in development

```
yarn start
```

## Usage

### Routes

_All `:text` with non-ascii characters must be urlencoded._

- **GET** `/words`: Shows all stored words. _Careful: no pagination available._
- **GET** `/words/:text`: Get the stored word and its status. It might be
`processing` or `processed`, indicating if it's still calculating against the
words stored before it or if it's done.
- **PUT** `/words/:text`: Store a word and starts a job to calculate its
distance to all words previously stored. If the word didn't exist, it returns
the status code `201 Created`. If it did it returns `403 Forbidden`.
- **GET** `/words/:text/similar(?threshold=:threshold)`: List similar stored
words with calculated distances within a threshold of the given `:text` keyword.
The default threshold is `3`, or optionally set by `:threshold`. In any case,
the maximum threshold that will be used is half the size of the largest word in
the compared distance, rounded up. E.g., `maça-uva` maximum stored threshold is
`2` (not stored), while `abacate-banana` is `4` (stored). _Careful: no
pagination available._

Jobs are visible at `/jobs` from any browser protected by basic auth. The
default login/password is `admin/admin`

### Build and start in production

```
yarn build
yarn start-production
```

### Environment Variables

- `ADMIN_USERS_JSON`: configures users and passwords for the basic auth
protecting the `/jobs` path. Must be a JSON object, the key is the username and
the value the password. Ex.: `{ "alice": "mirror", "bob": "home" }`. _Default:
`{ "admin": "admin" }`._
- `MONGO`: MongoDB connection string. _Default:`mongodb://localhost/soclose`._
- `REDIS_HOST`: Redis hostname. _Default:`localhost`._
- `REDIS_PORT`: Redis port. _Default:`6379`._
- `PORT`: Port on which to run the Express webserver. _Default:`3000`._

## Rationale

The current setup will pre-calculate a new word distance to all other distances
to avoid disproportional response times and store those within a maximum
threshold. Here's the reasoning behind it:

### Dictionary sizes

Estimated word count for English, generally accepted as the language with the
largest vocabulary, is
[around 1M+](https://www.merriam-webster.com/help/faq-how-many-english-words).
Most dictionaries however [are below 400k+](https://dicionarioegramatica.com.br/tag/quantas-palavras-no-houaiss/),
including English.

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

### Maximum threshold

A high threshold means returning words that sound completely unrelated. Taking
a six characters word and allowing for a threshold of six means replacing the
whole word by another of the same size. For praticality, the maximum calculated
threshold accepted for a word for this calculations will be half its size.

### Caching

Assuming all the 450k dictionary is accessed daily, and about 2k words are
returned on average using about 40bytes of JSON per word, this means about 41G
of cache. Response time for cached queries would be really fast, but missed
ones would mean waiting up for several seconds. Also, adding new words means
invalidating many cache entries at once.

### Precalculating

Storing the calculations would mean adding a word takes longer, but retrieving
speeds are more constant. Like caching, this would take about 41GB of stored
data, plus any DB overhead needed. If the database has the option to keep the
data indexed in memory it will be fast enough to work almost like a cache -
although this doesn't invalidate the presence of one, but with simpler rules and
low expiration times.
