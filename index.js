const functions = require('firebase-functions');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const filename = process.env.NODE_ENV === 'production' ? './server/server' : './__sapper__/build/server/server';
const entrypoint = require(filename);

const snapsSnapshotPubsubTopic = functions.config().pubsub.snaps_snapshot_topic
const newSnapsPubsubTopic = functions.config().pubsub.newsnaps_topic

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
}).pubsub.schedule('every 1 hours').onRun((...args) => entrypoint.getCollectStats(false)(...args));
const dailyStats = functions.runWith({
    timeoutSeconds: 300,
    memory: '512MB'
}).pubsub.schedule('38 23 * * *').onRun((...args) => entrypoint.getCollectStats(true)(...args));
// export const dailyStats = functions.pubsub.schedule('every 24 hours').onRun(collectStats(true));
const dailyRatings = functions.runWith({
    timeoutSeconds: 30,
    memory: '128MB',
}).pubsub.schedule('every 24 hours').onRun((...args) => entrypoint.getCollectRatings(...args));
const dailyThinStats = functions.runWith({
    timeoutSeconds: 300,
    memory: '128MB',
}).pubsub.schedule('48 23 * * *').onRun((...args) => entrypoint.getThinStats(...args));

const snapsSnapshotSubscriber = functions.runWith({
    timeoutSeconds: 60,
    memory: '128MB',
}).pubsub.topic(snapsSnapshotPubsubTopic).onPublish((...args) => entrypoint.getSnapsSnapshotSubscriber(...args));
const newSnapSubscriber = functions.runWith({
    timeoutSeconds: 60,
    memory: '128MB',
}).pubsub.topic(newSnapsPubsubTopic).onPublish((...args) => entrypoint.getNewSnapsSubscriber(...args));

module.exports = {
    server,
    graphql,
    hourlyStats,
    dailyStats,
    dailyRatings,
    dailyThinStats,
    snapsSnapshotSubscriber,
    newSnapSubscriber,
};
