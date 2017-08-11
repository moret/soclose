import mongoose from 'mongoose';
import express from 'express';
import morgan from 'morgan';
import basicAuth from 'express-basic-auth';
import Queue from 'bull';
import Arena from 'bull-arena';

const adminUsers = process.env.ADMIN_USERS_JSON || JSON.stringify({
  admin: 'admin',
});
const mongo = process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost/soclose';
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = Number(process.env.REDIS_PORT || 6379);
const port = Number(process.env.PORT || 3000);

async function main() {
  mongoose.Promise = global.Promise;
  await mongoose.connect(mongo, { useMongoClient: true });
  const wordSchema = new mongoose.Schema({
    text: {
      type: String,
      minlength: 1,
      maxlength: 50,
    },
    status: String,
  });
  wordSchema.index({ text: 1 }, { unique: true });
  const Word = mongoose.model('Word', wordSchema);
  async function newWordDistances(job) {
    const text = job.data.newWord.text;
    const word = await Word.findOne({ text });
    const words = await Word.find();
    word.status = 'processed';
    await word.save();
  };
  const newWordDistancesQueue = new Queue('new word distances', {
    redis: {    
      host: redisHost,
      port: redisPort,
    }
  });
  newWordDistancesQueue.process(newWordDistances);
  const app = express();
  app.use(morgan('tiny'));
  app.use('/jobs',
    basicAuth({ users: JSON.parse(adminUsers), challenge: true })
  );
  app.use(Arena({
    queues: [
      {
        hostId: redisHost,
        name: 'new word distances',
        host: redisHost,
        port: redisPort,
      }
    ]
  }, {
    basePath: '/jobs',
    disableListen: true,
  }));
  app.get('/words', async (req, res) => {
    const words = await Word.find({});
    res.send(words);
  });
  app.get('/words/:text', async (req, res) => {
    const text = req.params.text;
    const word = await Word.findOne({ text });
    res.send(word);
  });
  app.put('/words/:text', async (req, res) => {
    const text = req.params.text;
    const newWord = new Word({ text, status: 'added' });
    await newWord.save();
    newWordDistancesQueue.add({ newWord });
    res.send(newWord);
  });
  app.listen(port, () => console.log('So close! listening on 3000.'));
}

main();
