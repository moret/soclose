import mongoose from 'mongoose';
import { mongo } from './settings';

export default async function() {  
  mongoose.Promise = global.Promise;
  await mongoose.connect(mongo, { useMongoClient: true });
}
