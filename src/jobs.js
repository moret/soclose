import { Word } from './models';

export async function newWordDistances(job) {
  const text = job.data.newWord.text;
  const word = await Word.findOne({ text });
  const words = await Word.find();
  word.status = 'processed';
  await word.save();
};
