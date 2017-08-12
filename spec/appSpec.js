import request from 'supertest';
import app from '../src/app';
import { Word } from '../src/models';

describe('app', () => {
  let body, status, text;
  const mockedFailure = new Error('Mocked Failure');

  beforeEach(async () => {
    await Word.remove({});
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
});
