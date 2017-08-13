import mongoose from 'mongoose';

const wordType = {
  type: String,
  minlength: 1,
  maxlength: 50,
};

const wordSchema = new mongoose.Schema({
  text: wordType,
  status: String,
});
wordSchema.index({ text: 1 }, { unique: true });
const Word = mongoose.model('Word', wordSchema);

const wordToWordDistanceSchema = new mongoose.Schema({
  textA: wordType,
  textB: wordType,
  distance: Number,
});

wordToWordDistanceSchema.index({ textA: 1, textB: 1 }, { unique: true });
wordToWordDistanceSchema.index({ distance: 1 });

const WordToWordDistance = mongoose.model('WordToWordDistance', wordToWordDistanceSchema);

export {
  Word,
  WordToWordDistance,
};
