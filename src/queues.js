import Bull from 'bull';
import Arena from 'bull-arena';
import settings, { redis } from './settings';
import { newWordDistances } from './jobs';

const arenaMiddleware = Arena(
  {
    queues: [
      {
        hostId: redis.host,
        name: "new word distances",
        host: redis.host,
        port: redis.port
      }
    ]
  },
  { basePath: "/jobs", disableListen: true }
);
const newWordDistancesQueue = new Bull('new word distances', { redis });
newWordDistancesQueue.process(newWordDistances);

export { arenaMiddleware, newWordDistancesQueue };