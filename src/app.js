import express from 'express';
import morgan from 'morgan';
import basicAuth from 'express-basic-auth';
import { adminUsers, disableMorgan } from './settings';
import { arenaMiddleware, newWordDistancesQueue } from './queues';
import { Word } from './models';

const app = express();
if (!disableMorgan) app.use(morgan('tiny'));
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
    const text = req.params.text;
    const word = await Word.findOne({ text });
    if (word) {
      res.send(word);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});
app.put('/words/:text', async (req, res) => {
  const text = req.params.text;
  const newWord = new Word({ text, status: 'added' });
  await newWord.save();
  newWordDistancesQueue.add({ newWord });
  res.send(newWord);
});

export default app;
