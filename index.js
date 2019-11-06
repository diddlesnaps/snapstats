const functions = require('firebase-functions');
const fs = require('fs');
const isProd = !fs.existsSync('src');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const filename = isProd ? './server/server' : './__sapper__/build/server/server';
const entrypoint = require(filename);

const server = functions.runWith({
    timeoutSeconds: 45,
    memory: '256MB',
}).https.onRequest((...args) => entrypoint.getApp(...args));

const graphql = functions.runWith({
    timeoutSeconds: 30,
    memory: '256MB',
}).https.onRequest((...args) => entrypoint.getGraphQL(...args));

const hourlyStats = functions.runWith({
    timeoutSeconds: 300,
    memory: '512MB'
}).pubsub.schedule('every 4 hours').onRun((...args) => entrypoint.getCollectStats(false)(...args));
// export const dailyStats = functions.pubsub.schedule('every 24 hours').onRun(collectStats(true));
const dailyRatings = functions.runWith({
    timeoutSeconds: 30,
    memory: '128MB',
}).pubsub.schedule('every 24 hours').onRun((...args) => entrypoint.getCollectRatings(...args));
const dailyThinning = functions.runWith({
    timeoutSeconds: 300,
    memory: '512MB',
}).pubsub.schedule('48 23 * * *').onRun((...args) => entrypoint.getThinStats(...args));

module.exports = {server, graphql, hourlyStats, dailyRatings, dailyThinning};
