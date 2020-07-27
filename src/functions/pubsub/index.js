// @ts-check

import * as functions from 'firebase-functions';

const snapsSnapshotPubsubTopic = functions.config().pubsub.snaps_snapshot_topic;
const newSnapsPubsubTopic = functions.config().pubsub.newsnaps_topic;

export const snapsSnapshotSubscriber = functions.runWith({
    timeoutSeconds: 30,
    memory: '256MB',
}).pubsub.topic(snapsSnapshotPubsubTopic).onPublish(async (message) => (await import('./snapsSnapshot')).default(message));
export const newSnapSubscriber = functions.runWith({
    timeoutSeconds: 30,
    memory: '256MB',
}).pubsub.topic(newSnapsPubsubTopic).onPublish(async (message) => (await (await import('./newSnaps')).default(message)));
