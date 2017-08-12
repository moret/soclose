import mongoose from 'mongoose';

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

export { Word };
