import mongooseConnect from '../../src/mongooseConnect'

async function setup() {
  await mongooseConnect();
}

setup();
