import distance from './distance';
import { Word, WordToWordDistance } from './models';

export async function newWordDistances(job) {
  const text = job.data.text;
  const maximumTextThreshold = Math.ceil(text.length / 2);
  const word = await Word.findOne({ text });
  const words = await Word.find({});
  let processedCount = 0;
  words.forEach(async ({ text: otherText }) => {
    if (text != otherText) {
      const maximumThreshold = Math.max(
        maximumTextThreshold,
        Math.ceil(otherText.length / 2)
      );
      const textToTextDistance = distance(text, otherText);
      if (textToTextDistance <= maximumThreshold) {
        const textA = text < otherText ? text : otherText;
        const textB = text < otherText ? otherText : text;
        await WordToWordDistance.findOneAndUpdate(
          { textA, textB },
          { $set: { distance: textToTextDistance } },
          { upsert: true, new: true }
        );
      }
    }
    job.progress(Math.round(((++processedCount) / words.length) * 100));
  });
  word.status = 'processed';
  await word.save();
};
