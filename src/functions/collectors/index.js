// @ts-check

import * as functions from 'firebase-functions';

export const hourlyStats = functions.runWith({
    timeoutSeconds: 540,
    memory: '512MB'
}).pubsub.schedule('every 1 hours').onRun(async (context) => (await import('./collectStats')).hourly(context));
export const dailyStats = functions.runWith({
    timeoutSeconds: 540,
    memory: '512MB'
}).pubsub.schedule('38 23 * * *').onRun(async (context) => (await import('./collectStats')).daily(context));
export const hourlyLicenses = functions.runWith({
    timeoutSeconds: 30,
    memory: '256MB',
}).pubsub.schedule('every 1 hours').onRun(async (context) => (await import('./extractLicenses')).hourly(context));
export const dailyLicenses = functions.runWith({
    timeoutSeconds: 30,
    memory: '256MB',
}).pubsub.schedule('52 23 * * *').onRun(async (context) => (await import('./extractLicenses')).daily(context));
// export const dailyStats = functions.pubsub.schedule('every 24 hours').onRun(collectStats(true));
export const dailyRatings = functions.runWith({
    timeoutSeconds: 30,
    memory: '256MB',
}).pubsub.schedule('every 24 hours').onRun(async (context) => (await import('./collectRatings')).default(context));
export const dailyThinStats = functions.runWith({
    timeoutSeconds: 300,
    memory: '256MB',
}).pubsub.schedule('48 23 * * *').onRun(async (context) => (await import('./thinStats')).default(context));
