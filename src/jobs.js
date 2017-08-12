import { Word } from './models';

export async function newWordDistances(job) {
  const text = job.data.text;
  const word = await Word.findOne({ text });
  word.status = 'processed';
  await word.save();
};
