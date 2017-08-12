import mongoose from 'mongoose';
import app from './app';
import { mongo, port } from './settings';

async function main() {
  try {
    mongoose.Promise = global.Promise;
    await mongoose.connect(mongo, { useMongoClient: true });
    app.listen(port, () => console.log('So close! listening on 3000.'));
  } catch (e) {
    console.error(e);
    process.exit(-1);    
  }
}

main();
