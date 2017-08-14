import express from 'express';
import morgan from 'morgan';
import basicAuth from 'express-basic-auth';
import { adminUsers, defaultThreshold } from './settings';
import { arenaMiddleware, newWordDistancesQueue } from './queues';
import { Word, WordToWordDistance } from './models';

const app = express();
if (process.env.NODE_ENV != 'test') app.use(morgan('tiny'));
app.use('/jobs', basicAuth({ users: JSON.parse(adminUsers), challenge: true }));
app.use(arenaMiddleware);
app.get('/words', async (req, res) => {
  try {
    const words = await Word.find({});
    res.send(words);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});
app.get('/words/:text', async (req, res) => {
  try {
    const text = req.params.text.toLowerCase();
    if (text.length <= 50) {
      const word = await Word.findOne({ text });
      if (word) {
        res.send(word);
      } else {
        res.sendStatus(404);
      }
    } else {
      res.sendStatus(400);
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});
app.get('/words/:text/similar', async (req, res) => {
  try {
    const givenThreshold = req.query.threshold;
    const validThreshold = givenThreshold && Number(givenThreshold) >= 0;
    const text = req.params.text.toLowerCase();
    if ((givenThreshold == undefined || validThreshold) && text.length <= 50) {
      const word = await Word.findOne({ text });
      if (word) {
        const threshold = givenThreshold == undefined
          ? defaultThreshold
          : Number(givenThreshold);
        const wordToWordDistances = await WordToWordDistance.find({
          $or: [
            { textA: text },
            { textB: text },
          ],
          distance: { $lte: threshold },
        }).sort({ distance: 1 });
        res.send(wordToWordDistances.map(({ textA, textB, distance }) => ({
          word: ((text == textA) ? textB : textA),
          distance,
        })));
      } else {
        res.sendStatus(404);
      }
    } else {
      res.sendStatus(400);
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});
app.put('/words/:text', async (req, res) => {
  try {
    const text = req.params.text.toLowerCase();
    if (text.length <= 50) {
      const word = await Word.findOne({ text });
      if (word) {
        res.sendStatus(403);
      } else {
        const newWord = new Word({ text, status: 'processing' });
        await newWord.save();
        newWordDistancesQueue.add({ text });
        res.sendStatus(201);
      }
    } else {
      res.sendStatus(400);
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

export default app;
