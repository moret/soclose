import {
  newWordDistances,
  __RewireAPI__ as JobsRewireAPI,
} from '../src/jobs';
import distance from '../src/distance';
import { Word, WordToWordDistance } from '../src/models';

function noOp() {
  // no-op
}

beforeEach(async () => {
  await Word.remove({});
  await WordToWordDistance.remove({});
});

describe('newWordDistances', () => {
  const text = 'paraíba';
  const job = { data: { text }, progress: noOp };
  let distanceSpy;
  let word;

  beforeEach(async () => {
    distanceSpy = jasmine.createSpy('distanceSpy').and.callFake(distance);
    JobsRewireAPI.__Rewire__('distance', distanceSpy);
    spyOn(job, 'progress');
    await Promise.all([
      'paraibano',
      'paraiba',
      'pará',
      'imbaíba',
      'sambaíba',
      'pindaíba',
      'pernambuco',
      'sergipe',
      'alagoas',
    ].map(text => new Word({ text, status: 'processed' }).save()));
    await new Word({ text, status: 'processing' }).save();
    await newWordDistances(job);
    word = await Word.findOne({ text });
  });

  afterEach(() => {
    JobsRewireAPI.__ResetDependency__('distance');
  });

  it('sets status to processed when finished', () => {
    expect(word.status).toBe('processed');
  });

  it('calculates the distance to all words except itself', () => {
    expect(distanceSpy.calls.count()).toBe(9);
  });

  it('updates progress for each word looped, including itself', () => {
    expect(job.progress.calls.count()).toBe(10);
    expect(job.progress.calls.argsFor(9)).toEqual([100]);
  });

  describe('calculated distances', () => {
    let distancesCount;
    let imbaibaToParaiba;
    let paraibaToParaiba;
    let paraibaToSambaiba;

    beforeEach(async () => {
      distancesCount = await WordToWordDistance.count({});
      imbaibaToParaiba = await WordToWordDistance.findOne({
        textA: 'imbaíba',
        textB: 'paraíba',
      });
      paraibaToParaiba = await WordToWordDistance.findOne({
        textA: 'paraiba',
        textB: 'paraíba',
      });
      paraibaToSambaiba = await WordToWordDistance.findOne({
        textA: 'paraíba',
        textB: 'sambaíba',
      });
    });

    it('stores one for each calculation under the maximum threshold', () => {
      expect(distancesCount).toBe(6);
    });

    it('chooses attributes by alphabetical order', () => {
      expect(imbaibaToParaiba).not.toBeNull();
      expect(paraibaToSambaiba).not.toBeNull();
    });

    it('stores the calculated value', () => {
      expect(imbaibaToParaiba.distance).toBe(3);
      expect(paraibaToSambaiba.distance).toBe(3);
    });

    it('stores zero distance words too', () => {
      expect(paraibaToParaiba.distance).toBe(0);
    });
  });

  describe('maximum threshold', () => {
    let abacateToBanana;
    let bananaToMamao;

    beforeEach(async () => {
      await new Word({ text: 'abacate', status: 'processed' }).save();
      await new Word({ text: 'mamão', status: 'processed' }).save();
      await new Word({ text: 'banana', status: 'processing' }).save();
      await newWordDistances({ data: { text: 'banana' }, progress: noOp });
      word = await Word.findOne({ text: 'banana' });
      abacateToBanana = await WordToWordDistance.findOne({
        textA: 'abacate',
        textB: 'banana',
      });
      bananaToMamao = await WordToWordDistance.findOne({
        textA: 'banana',
        textB: 'mamão',
      });
    });

    it('is half the size of the largest word, rounded down', () => {
      expect(abacateToBanana.distance).toBe(4);
      expect(bananaToMamao).toBeNull();
    });
  });
});
