import mongooseConnect from './mongooseConnect'
import app from './app';
import { port } from './settings';

async function main() {
  try {
    await mongooseConnect();
    app.listen(port, () => console.log('So close! listening on 3000.'));
  } catch (e) {
    console.error(e);
    process.exit(-1);    
  }
}

main();
