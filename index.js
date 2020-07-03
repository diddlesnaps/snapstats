const functions = require('firebase-functions');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const filename = process.env.NODE_ENV === 'production' ? './server/server' : './__sapper__/build/server/server';
const entrypoint = require(filename);

const snapsSnapshotPubsubTopic = functions.config().pubsub.snaps_snapshot_topic;
const newSnapsPubsubTopic = functions.config().pubsub.newsnaps_topic;

const server = functions.runWith({
    timeoutSeconds: 10,
    memory: '256MB',
}).https.onRequest(entrypoint.getApp);

const sitemap = functions.runWith({
    timeoutSeconds: 10,
    memory: '256MB',
}).https.onRequest(entrypoint.sitemap);

const graphql = functions.runWith({
    timeoutSeconds: 10,
    memory: '256MB',
}).https.onRequest(entrypoint.graphQL);

const hourlyStats = functions.runWith({
    timeoutSeconds: 300,
    memory: '512MB'
}).pubsub.schedule('every 1 hours').onRun(entrypoint.collectStats(false));
const dailyStats = functions.runWith({
    timeoutSeconds: 300,
    memory: '512MB'
}).pubsub.schedule('38 23 * * *').onRun(entrypoint.collectStats(true));
// export const dailyStats = functions.pubsub.schedule('every 24 hours').onRun(collectStats(true));
const dailyRatings = functions.runWith({
    timeoutSeconds: 30,
    memory: '256MB',
}).pubsub.schedule('every 24 hours').onRun(entrypoint.collectRatings);
const dailyThinStats = functions.runWith({
    timeoutSeconds: 300,
    memory: '256MB',
}).pubsub.schedule('48 23 * * *').onRun(entrypoint.thinSnaps);

const snapsSnapshotSubscriber = functions.runWith({
    timeoutSeconds: 30,
    memory: '256MB',
}).pubsub.topic(snapsSnapshotPubsubTopic).onPublish(entrypoint.snapsSnapshotSubscriber);
const newSnapSubscriber = functions.runWith({
    timeoutSeconds: 30,
    memory: '256MB',
}).pubsub.topic(newSnapsPubsubTopic).onPublish(entrypoint.newSnapsSubscriber);

module.exports = {
    server,
    sitemap,
    graphql,
    hourlyStats,
    dailyStats,
    dailyRatings,
    dailyThinStats,
    snapsSnapshotSubscriber,
    newSnapSubscriber,
};
