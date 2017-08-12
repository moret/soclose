import mongoose from 'mongoose';

async function setup() {
  mongoose.Promise = global.Promise;
  await mongoose.connect(
    'mongodb://localhost/soclose-tests',
    { useMongoClient: true }
  );
}

setup();
