import * as functions from 'firebase-functions';

import snapsSnapshot from './snapsSnapshot';
import newSnaps from './newSnaps';

const snapsSnapshotPubsubTopic = functions.config().pubsub.snaps_snapshot_topic;
const newSnapsPubsubTopic = functions.config().pubsub.newsnaps_topic;

export const snapsSnapshotSubscriber = functions.runWith({
    timeoutSeconds: 30,
    memory: '256MB',
}).pubsub.topic(snapsSnapshotPubsubTopic).onPublish(snapsSnapshot);
export const newSnapSubscriber = functions.runWith({
    timeoutSeconds: 30,
    memory: '256MB',
}).pubsub.topic(newSnapsPubsubTopic).onPublish(newSnaps);
