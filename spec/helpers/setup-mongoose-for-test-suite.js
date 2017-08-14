import mongooseConnect from '../../src/mongooseConnect'
import mongoose from 'mongoose';

async function setup() {
  await mongooseConnect();
}

setup();
