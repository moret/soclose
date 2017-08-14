import request from 'supertest';
import app from '../src/app';
import { newWordDistancesQueue } from '../src/queues';
import { Word, WordToWordDistance } from '../src/models';

let body, status, text;
const mockedFailure = new Error('Mocked Failure');
const longWord = 'taumatawhakatangihangakoauauotamateaturipukakapikimaungahoronukupokaiwhenuakitanatahu';

beforeEach(async () => {
  await Word.remove({});
  await WordToWordDistance.remove({});
});

describe('get /words', () => {
  beforeEach(async () => {
    await new Word({ text: 'banana', status: 'processing' }).save();
    await new Word({ text: 'abacate', status: 'processed' }).save();
    ({ body, status } = await request(app).get('/words'));
  });

  it('responds with 200', () => {
    expect(status).toBe(200);
  });

  it('lists all words with status', () => {
    expect(body[0].text).toBe('banana');
    expect(body[0].status).toBe('processing');
    expect(body[1].text).toBe('abacate');
    expect(body[1].status).toBe('processed');
  });

  describe('when an error occurs', () => {
    beforeEach(async () => {
      spyOn(console, 'error');
      spyOn(Word, 'find').and.throwError(mockedFailure);
      ({ status, text } = await request(app).get('/words'));
    });

    it('responds with 500', () => {
      expect(status).toBe(500);
    });

    it('says Internal Server Error', () => {
      expect(text).toBe('Internal Server Error');
    });

    it('logs the error', () => {
      expect(console.error).toHaveBeenCalledWith(mockedFailure);
    });
  });
});

describe('get /words/:text', () => {
  beforeEach(async () => {
    await new Word({ text: 'banana', status: 'processing' }).save();
  });

  describe('stored word', () => {
    beforeEach(async () => {
      ({ body, status } = await request(app).get('/words/banana'));
    });

    it('responds with 200', () => {
      expect(status).toBe(200);
    });

    it('gets the word with status', async () => {
      expect(body.text).toBe('banana');
      expect(body.status).toBe('processing');
    });

    describe('with capital letters', () => {
      beforeEach(async () => {
        ({ body } = await request(app).get('/words/BaNaNa'));
      });

      it('gets the lowercased word anyway', async () => {
        expect(body.text).toBe('banana');
      });
    })
  });

  describe('not stored word', () => {
    beforeEach(async () => {
      ({ status, text } = await request(app).get('/words/abacate'));
    });

    it('responds with 404', () => {
      expect(status).toBe(404);
    });

    it('says Not Found', () => {
      expect(text).toBe('Not Found');
    });
  });

  describe('word too long', () => {
    beforeEach(async () => {
      ({ status, text } = await request(app).get(`/words/${longWord}`));
    });

    it('responds with 400', () => {
      expect(status).toBe(400);
    });

    it('says Bad Request', () => {
      expect(text).toBe('Bad Request');
    });
  });

  describe('when an error occurs', () => {
    beforeEach(async () => {
      spyOn(console, 'error');
      spyOn(Word, 'findOne').and.throwError(mockedFailure);
      ({ status, text } = await request(app).get('/words/banana'));
    });

    it('responds with 500', () => {
      expect(status).toBe(500);
    });

    it('says Internal Server Error', () => {
      expect(text).toBe('Internal Server Error');
    });

    it('logs the error', () => {
      expect(console.error).toHaveBeenCalledWith(mockedFailure);
    });
  });
});

describe('put /words/:text', () => {
  describe('new word', () => {
    let noWord;
    let word;

    beforeEach(async () => {
      spyOn(newWordDistancesQueue, 'add');
      noWord = await Word.findOne({ text: 'banana' });
      ({ status, text } = await request(app).put('/words/banana'));
      word = await Word.findOne({ text: 'banana' });
    });

    it('responds with 201', () => {
      expect(status).toBe(201);
    });

    it('says Created', () => {
      expect(text).toBe('Created');
    });

    it('creates a new word', () => {
      expect(noWord).toBeNull();
      expect(word.text).toBe('banana');
      expect(word.status).toBe('processing');
    });

    it('queues a calculate job', () => {
      expect(newWordDistancesQueue.add).toHaveBeenCalledWith({
        text: 'banana'
      });
    });

  });

  describe('new word with capital letters', () => {
    let noWord;
    let word;

    beforeEach(async () => {
      noWord = await Word.findOne({ text: 'banana' });
      await request(app).put('/words/BaNaNa');
      word = await Word.findOne({ text: 'banana' });
    });

    it('creates the new word lowercased', async () => {
      expect(noWord).toBeNull();
      expect(word.text).toBe('banana');
    });
  })

  describe('existing word', () => {
    beforeEach(async () => {
      await new Word({ text: 'banana', status: 'processing' }).save();
      ({ status, text } = await request(app).put('/words/banana'));
    });

    it('responds with 403', () => {
      expect(status).toBe(403);
    });

    it('says Forbidden', () => {
      expect(text).toBe('Forbidden');
    });
  });

  describe('word too long', () => {
    beforeEach(async () => {
      ({ status, text } = await request(app).put(`/words/${longWord}`));
    });

    it('responds with 400', () => {
      expect(status).toBe(400);
    });

    it('says Bad Request', () => {
      expect(text).toBe('Bad Request');
    });
  });

  describe('when an error occurs', () => {
    beforeEach(async () => {
      spyOn(console, 'error');
      spyOn(Word, 'findOne').and.throwError(mockedFailure);
      ({ status, text } = await request(app).put('/words/banana'));
    });

    it('responds with 500', () => {
      expect(status).toBe(500);
    });

    it('says Internal Server Error', () => {
      expect(text).toBe('Internal Server Error');
    });

    it('logs the error', () => {
      expect(console.error).toHaveBeenCalledWith(mockedFailure);
    });
  });
});

describe('get /words/:text/similar', () => {
  beforeEach(async () => {
    await new Word({ text: 'paraiba', status: 'processing' }).save();
    await new WordToWordDistance(
      { textA: 'paraibano', textB: 'paraiba', distance: 2 }
    ).save();
    await new WordToWordDistance(
      { textA: 'paraiba', textB: 'sambaíbaçu', distance: 5 }
    ).save();
    await new WordToWordDistance(
      { textA: 'paraiba', textB: 'paraíba', distance: 0 }
    ).save();
    await new WordToWordDistance(
      { textA: 'paraiba', textB: 'pará', distance: 3 }
    ).save();
  });

  describe('stored word', () => {
    beforeEach(async () => {
      ({ body, status } = await request(app).get('/words/paraiba/similar'));
    });

    it('responds with 200', () => {
      expect(status).toBe(200);
    });

    it('gets words within the default threshold', async () => {
      expect(body.length).toBe(3);
    });

    it('sorts on most to least similar', async () => {
      expect(body[0].word).toBe('paraíba');
      expect(body[0].distance).toBe(0);
      expect(body[1].word).toBe('paraibano');
      expect(body[1].distance).toBe(2);
      expect(body[2].word).toBe('pará');
      expect(body[2].distance).toBe(3);
    });

    describe('with capital letters', () => {
      beforeEach(async () => {
        ({ body } = await request(app).get('/words/PaRaIbA/similar'));
      });

      it('gets words from the lowercased given text', async () => {
        expect(body.length).toBe(3);
      });
    })
  });

  describe('given threshold', () => {
    let zeroBody;
    let twoBody;
    let fiveBody;

    beforeEach(async () => {
      ({ body: zeroBody } = await request(app).get(
        '/words/paraiba/similar?threshold=0'
      ));
      ({ body: twoBody } = await request(app).get(
        '/words/paraiba/similar?threshold=2'
      ));
      ({ body: fiveBody } = await request(app).get(
        '/words/paraiba/similar?threshold=5'
      ));
    });

    it('limits results, even zero', () => {
      expect(zeroBody.length).toBe(1);
      expect(twoBody.length).toBe(2);
      expect(fiveBody.length).toBe(4);
    });
  });

  describe('invalid threshold', () => {
    [
      { invalidThreshold: '', reason: 'empty' },
      { invalidThreshold: '  ', reason: 'made of spaces' },
      { invalidThreshold: 'true', reason: 'boolean true' },
      { invalidThreshold: 'false', reason: 'boolean false' },
      { invalidThreshold: '{}', reason: 'looks like an object' },
      { invalidThreshold: '[]', reason: 'looks like an array' },
      { invalidThreshold: 'null', reason: 'text null' },
      { invalidThreshold: 'undefined', reason: 'text undefined' },
      { invalidThreshold: 'abcd', reason: 'non-numeric' },
      { invalidThreshold: '-1', reason: 'negative' },
      { invalidThreshold: 'NaN', reason: 'NaN' },
    ].forEach(({ invalidThreshold, reason }) => {
      describe(`when ${reason}`, () => {
        beforeEach(async () => {
          ({ status, text } = await request(app).get(
            `/words/paraiba/similar?threshold=${invalidThreshold}`
          ));
        });

        it('responds with 400', () => {
          expect(status).toBe(400);
        });

        it('says Bad Request', () => {
          expect(text).toBe('Bad Request');
        });
      });
    })
  });

  describe('word too long', () => {
    beforeEach(async () => {
      ({ status, text } = await request(app).get(`/words/${longWord}/similar`));
    });

    it('responds with 400', () => {
      expect(status).toBe(400);
    });

    it('says Bad Request', () => {
      expect(text).toBe('Bad Request');
    });
  });

  describe('not stored word', () => {
    beforeEach(async () => {
      ({ status, text } = await request(app).get('/words/pernambuco/similar'));
    });

    it('responds with 404', () => {
      expect(status).toBe(404);
    });

    it('says Not Found', () => {
      expect(text).toBe('Not Found');
    });
  });

  describe('when an error occurs', () => {
    beforeEach(async () => {
      spyOn(console, 'error');
      spyOn(Word, 'findOne').and.throwError(mockedFailure);
      ({ status, text } = await request(app).get('/words/paraiba/similar'));
    });

    it('responds with 500', () => {
      expect(status).toBe(500);
    });

    it('says Internal Server Error', () => {
      expect(text).toBe('Internal Server Error');
    });

    it('logs the error', () => {
      expect(console.error).toHaveBeenCalledWith(mockedFailure);
    });
  });
});
