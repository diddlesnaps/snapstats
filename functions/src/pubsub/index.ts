import * as functions from "firebase-functions";

const snapshotTopics = {
  newSnapsTopic:  functions.config().pubsub.newsnaps_topic,
  snapsSnapshotTopic: functions.config().pubsub.snaps_snapshot_topic,
  architecturesSnapshotTopic: functions.config().pubsub.architectures_snapshot_topic,
  basesSnapshotTopic: functions.config().pubsub.bases_snapshot_topic,
  channelsSnapshotTopic: functions.config().pubsub.channels_snapshot_topic,
  confinementsSnapshotTopic: functions.config().pubsub.confinements_snapshot_topic,
  developerCountsSnapshotTopic: functions.config().pubsub.developer_counts_snapshot_topic,
  sectionsSnapshotTopic: functions.config().pubsub.sections_snapshot_topic,
  snapCountsSnapshotTopic: functions.config().pubsub.snap_counts_snapshot_topic,
};
export const snapsSnapshotSubscriber = functions.runWith({
  timeoutSeconds: 30,
  memory: "256MB",
}).pubsub.topic(snapshotTopics.snapsSnapshotTopic).onPublish(async (message) => (await import("./snapsSnapshot")).default(message));
export const newSnapSubscriber = functions.runWith({
  timeoutSeconds: 30,
  memory: "256MB",
}).pubsub.topic(snapshotTopics.newSnapsTopic).onPublish(async (message) => (await (await import("./newSnaps")).default(message)));
export const architecturesSubscriber = functions.runWith({
  timeoutSeconds: 30,
  memory: "128MB",
}).pubsub.topic(snapshotTopics.architecturesSnapshotTopic).onPublish(async (message) => (await (await import("./architecturesSnapshot")).default(message)));
export const basesSubscriber = functions.runWith({
  timeoutSeconds: 30,
  memory: "128MB",
}).pubsub.topic(snapshotTopics.basesSnapshotTopic).onPublish(async (message) => (await (await import("./basesSnapshot")).default(message)));
export const channelSubscriber = functions.runWith({
  timeoutSeconds: 30,
  memory: "128MB",
}).pubsub.topic(snapshotTopics.channelsSnapshotTopic).onPublish(async (message) => (await (await import("./channelsSnapshot")).default(message)));
export const confinementsSubscriber = functions.runWith({
  timeoutSeconds: 30,
  memory: "128MB",
}).pubsub.topic(snapshotTopics.confinementsSnapshotTopic).onPublish(async (message) => (await (await import("./confinementsSnapshot")).default(message)));
export const developerCountsSubscriber = functions.runWith({
  timeoutSeconds: 30,
  memory: "128MB",
}).pubsub.topic(snapshotTopics.developerCountsSnapshotTopic).onPublish(async (message) => (await (await import("./developerCountsSnapshot")).default(message)));
export const sectionsSubscriber = functions.runWith({
  timeoutSeconds: 30,
  memory: "128MB",
}).pubsub.topic(snapshotTopics.sectionsSnapshotTopic).onPublish(async (message) => (await (await import("./sectionsSnapshot")).default(message)));
export const snapCountsSubscriber = functions.runWith({
  timeoutSeconds: 30,
  memory: "128MB",
}).pubsub.topic(snapshotTopics.snapCountsSnapshotTopic).onPublish(async (message) => (await (await import("./snapCountsSnapshot")).default(message)));
