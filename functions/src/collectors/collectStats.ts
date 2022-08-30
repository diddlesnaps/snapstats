import * as functions from "firebase-functions";
import {PubSub} from "@google-cloud/pubsub";

import {getStats} from "../snapstore-api/index.js";
import {updateLastUpdated} from "./updateLastUpdated.js";
import {LastUpdatedModel} from "../models/LastUpdated.js";

import snapshotVersion from "../snapshotVersion.js";
import {connectMongoose} from "../mongodb.js";
import {SnapsModel} from "../models/Snaps.js";

const denysave = process.env.denysave === "true" ? true : false;

const collector = (isDaily = false) => async () => {
  const date = Date.now();
  console.log(`Updating stats at ${new Date(date).toLocaleString()}`);
  try {
    const stats = (await getStats()).shift();
    if (!stats) {
      throw new Error("No data returned from getStats().");
    }
    const {
      architectures,
      bases,
      channels,
      confinements,
      developer_counts,
      sections,
      snap_counts,
    } = stats;
    const {snaps} = stats;

    const addDate = (dateKey?: string) =>
      <T>(data: T): (T & { [x: string]: number; }) => {
        const key = dateKey || "date";
        return {...data, [key]: date};
      };
    const addIsDaily = <T>(data: T): (T & {isDaily: boolean}) => {
      return {...data, isDaily};
    };

    if (denysave) {
      console.debug("collectors/collectStats.js: NOT saving stats");
    } else {
      console.debug("collectors/collectStats.js: Saving stats");
      const pubsub = new PubSub();
      const snapshotTopics = {
        snapsSnapshotTopic: pubsub.topic(
            functions.config().pubsub.snaps_snapshot_topic),
        architecturesSnapshotTopic: pubsub.topic(
            functions.config().pubsub.architectures_snapshot_topic),
        basesSnapshotTopic: pubsub.topic(
            functions.config().pubsub.bases_snapshot_topic),
        channelsSnapshotTopic: pubsub.topic(
            functions.config().pubsub.channels_snapshot_topic),
        confinementsSnapshotTopic: pubsub.topic(
            functions.config().pubsub.confinements_snapshot_topic),
        developerCountsSnapshotTopic: pubsub.topic(
            functions.config().pubsub.developer_counts_snapshot_topic),
        sectionsSnapshotTopic: pubsub.topic(
            functions.config().pubsub.sections_snapshot_topic),
        snapCountsSnapshotTopic: pubsub.topic(
            functions.config().pubsub.snap_counts_snapshot_topic),
      };

      await connectMongoose();

      let data: Buffer;
      data = Buffer.from(
          JSON.stringify(architectures.map(addDate()).map(addIsDaily)), "utf8");
      try {
        await snapshotTopics.architecturesSnapshotTopic
            .publishMessage({data});
      } catch (e) {
        console.error("pubsub/snapsSnapshot.js: " +
            `Error: Architectures PubSub publish: ${e}`);
      }

      data = Buffer.from(
          JSON.stringify(bases.map(addDate()).map(addIsDaily)), "utf8");
      try {
        await snapshotTopics.basesSnapshotTopic
            .publishMessage({data});
      } catch (e) {
        console.error("pubsub/snapsSnapshot.js:" +
            `Error: Bases PubSub publish: ${e}`);
      }

      data = Buffer.from(
          JSON.stringify(channels.map(addDate()).map(addIsDaily)), "utf8");
      try {
        await snapshotTopics.basesSnapshotTopic
            .publishMessage({data});
      } catch (e) {
        console.error("pubsub/snapsSnapshot.js:" +
            `Error: Channels PubSub publish: ${e}`);
      }

      data = Buffer.from(
          JSON.stringify(confinements.map(addDate()).map(addIsDaily)), "utf8");
      try {
        await snapshotTopics.confinementsSnapshotTopic
            .publishMessage({data});
      } catch (e) {
        console.error("pubsub/snapsSnapshot.js:" +
            `Error: Confinements PubSub publish: ${e}`);
      }

      data = Buffer.from(
          JSON.stringify([addIsDaily(addDate()(developer_counts))]), "utf8");
      try {
        await snapshotTopics.developerCountsSnapshotTopic
            .publishMessage({data});
      } catch (e) {
        console.error("pubsub/snapsSnapshot.js:" +
            `Error: DeveloperCounts PubSub publish: ${e}`);
      }

      data = Buffer.from(
          JSON.stringify(sections.map(addDate()).map(addIsDaily)), "utf8");
      try {
        await snapshotTopics.sectionsSnapshotTopic
            .publishMessage({data});
      } catch (e) {
        console.error("pubsub/snapsSnapshot.js:" +
            `Error: Sections PubSub publish: ${e}`);
      }

      data = Buffer.from(
          JSON.stringify([addIsDaily(addDate()(snap_counts))]), "utf8");
      try {
        await snapshotTopics.snapCountsSnapshotTopic
            .publishMessage({data});
      } catch (e) {
        console.error("pubsub/snapsSnapshot.js:" +
            `Error: SnapCounts PubSub publish: ${e}`);
      }

      console.debug("collectors/collectStats.js: " +
          "Publishing Snaps to snapshot PubSub topic");

      const snapNames = new Set(snaps.map(({snap}) => snap.package_name));

      const {date: prevSnapshotDateObj} =
          await LastUpdatedModel.findOne() ?? {date: new Date()};
      const prevSnapshotDateTimestamp = prevSnapshotDateObj.getTime();

      for (const snapData of snaps) {
        if (Date.parse(snapData.snap.last_updated) >
            prevSnapshotDateTimestamp ||
            Date.parse(snapData.snap.date_published) >
            prevSnapshotDateTimestamp ||
            !(await SnapsModel.exists({
              package_name: snapData.snap.package_name,
            }))) {
          const data = Buffer.from(
              JSON.stringify(addDate("snapshot_date")(snapData)), "utf8");
          try {
            await snapshotTopics.snapsSnapshotTopic
                .publishMessage({data});
          } catch (e) {
            console.error("collectors/collectStats.js: Error: " +
                `Snap '${snapData.snap.package_name}' PubSub publish: ${e}`);
          }
        }
      }

      await SnapsModel.deleteMany({
        $or: [
          {snapshotVersion: {$lt: snapshotVersion}},
          {package_name: {$nin: [...snapNames]}},
        ],
      });
      await updateLastUpdated(new Date(date));
    }
  } catch (err) {
    console.error(`collectors/collectStats.js: Error: collectStats(): ${err}`);
  }
  console.log(`Stats update completed at ${new Date().toLocaleString()}`);
};

export const hourly = collector(false);
export const daily = collector(true);
