import * as functions from 'firebase-functions';

import {hourly, daily} from './collectStats';
import ratings from './collectRatings';
import thin from './thinStats';

export const hourlyStats = functions.runWith({
    timeoutSeconds: 300,
    memory: '512MB'
}).pubsub.schedule('every 1 hours').onRun(hourly);
export const dailyStats = functions.runWith({
    timeoutSeconds: 300,
    memory: '512MB'
}).pubsub.schedule('38 23 * * *').onRun(daily);
// export const dailyStats = functions.pubsub.schedule('every 24 hours').onRun(collectStats(true));
export const dailyRatings = functions.runWith({
    timeoutSeconds: 30,
    memory: '256MB',
}).pubsub.schedule('every 24 hours').onRun(ratings);
export const dailyThinStats = functions.runWith({
    timeoutSeconds: 300,
    memory: '256MB',
}).pubsub.schedule('48 23 * * *').onRun(thin);
