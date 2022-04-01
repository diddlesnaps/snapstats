import * as functions from "firebase-functions";
import {PubSub} from "@google-cloud/pubsub";

import {ArchitecturesModel} from "../models/Architecture.js";
import {BasesModel} from "../models/Base.js";
import {ChannelsModel} from "../models/Channel.js";
import {ConfinementsModel} from "../models/Confinement.js";
import {DeveloperCountsModel} from "../models/DeveloperCount.js";
import {SectionsModel} from "../models/Section.js";
import {SnapCountsModel} from "../models/SnapCount.js";
import {SnapsModel} from "../models/Snaps.js";

import {getStats} from "../snapstore-api/index.js";
import {updateLastUpdated} from "./updateLastUpdated.js";
import {LastUpdatedModel} from "../models/LastUpdated.js";

import snapshotVersion from "../snapshotVersion.js";
import {connectMongoose} from "../mongodb.js";
import {SnapApiSnapResult} from "../snapstore-api/types.js";

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
    let {snaps} = stats;

    console.debug("collectors/collectStats.js: Mapping Snaps by package_name");
    const snapsByName: {[key: string]: SnapApiSnapResult} = {};
    snaps.forEach(({details_api_url, snap}) => {
      if (!snap.package_name) {
        return;
      }
      const name = snap.package_name;
      if (snapsByName[name]) {
        if (snap.architecture) {
          if (snapsByName[name].snap.architecture) {
            snapsByName[name].snap.architecture = [
              ...snapsByName[name].snap.architecture,
              ...snap.architecture,
            ];
          } else {
            snapsByName[name].snap.architecture = snap.architecture;
          }
        }
      } else {
        snapsByName[name] = {
          snap,
          details_api_url,
        };
      }
    });

    snaps = Object.values(snapsByName).map(({snap, details_api_url}) => {
      snap.architecture = [...new Set(snap.architecture)];
      snap.sections = [
        ...new Set(
            (snap.sections as unknown as {name: string}[]).map(
                (section) => section.name
            )
        )] as string[];
      return {
        snap,
        details_api_url,
      };
    });

    const addDate = (dateKey: string | null = null) => <T>(data: T): (T & { [x: string]: number; }) => {
      const key = dateKey || "date";
      return {...data, [key]: date};
    };
    const addIsDaily = <T>(data: T & {isDaily: boolean}) => {
      return {...data, isDaily};
    };

    if (denysave) {
      console.debug("collectors/collectStats.js: NOT saving stats");
    } else {
      console.debug("collectors/collectStats.js: Saving stats");
      await connectMongoose();

      let promises: Promise<any>[] = [
        ArchitecturesModel.insertMany(
            architectures.map((architecture) => (architecture.name) ? architecture : {...architecture, name: "unset"})
                .map(addDate())
                .map(addIsDaily)
        ).catch((err) => console.error(`collectors/collectStats.js: Error: architectures: ${err.toString()}`)),

        BasesModel.insertMany(
            bases.map((base) => (base.name) ? base : {...base, name: "core"})
                .map(addDate())
                .map(addIsDaily)
        ).catch((err) => console.error(`collectors/collectStats.js: Error: bases: ${err.toString()}`)),

        ChannelsModel.insertMany(
            channels.map((channel) => (channel.name) ? channel : {...channel, name: "unset"})
                .map(addDate())
                .map(addIsDaily)
        ).catch((err) => console.error(`collectors/collectStats.js: Error: channels: ${err.toString()}`)),

        ConfinementsModel.insertMany(
            confinements.map((confinement) => (confinement.name) ? confinement : {...confinement, name: "unset"})
                .map(addDate())
                .map(addIsDaily)
        ).catch((err) => console.error(`collectors/collectStats.js: Error: confinements: ${err.toString()}`)),

        SectionsModel.insertMany(
            sections.map((section) => (section.name) ? section: {...section, name: "unset"})
                .map(addDate())
                .map(addIsDaily)
        ).catch((err) => console.error(`collectors/collectStats.js: Error: sections: ${err.toString()}`)),

        // SnapsModel.insertMany(
        //     snaps.map(snap => (snap.name) ? snap : { ...snap, name: 'unset' })
        //     .map(addDate('snapshot_date'))
        //     .map(addIsDaily)
        // ).catch(err => console.error(`collectors/collectStats.js: snaps: ${err.toString()}`)),

        DeveloperCountsModel.insertMany(
            [addDate()(developer_counts)]
                .map(addIsDaily)
        ).catch((err) => console.error(`collectors/collectStats.js: Error: developerCounts: ${err.toString()}`)),

        SnapCountsModel.insertMany(
            [addDate()(snap_counts)]
                .map(addIsDaily)
        ).catch((err) => console.error(`collectors/collectStats.js: Error: snapCounts: ${err.toString()}`)),
      ];

      await Promise.all(promises);

      console.debug("collectors/collectStats.js: Publishing Snaps to snapshot PubSub topic");

      const snapNames = new Set(snaps.map(({snap}) => snap.package_name));

      const pubsub = new PubSub();
      const snapsSnapshotPubsubTopic = pubsub.topic(functions.config().pubsub.snaps_snapshot_topic);
      const {date: prevSnapshotDateObj} = await LastUpdatedModel.findOne() || {date: new Date()};
      const prevSnapshotDateTimestamp = prevSnapshotDateObj.getTime();
      const existingSnaps = new Set((await SnapsModel.find()).map(snap => snap.package_name));

      promises = snaps
          .map(addDate("snapshot_date"))
          .filter(({snap: {package_name, last_updated, date_published}}) =>
            Date.parse(last_updated) > prevSnapshotDateTimestamp ||
            Date.parse(date_published) > prevSnapshotDateTimestamp ||
            !existingSnaps.has(package_name)
          )
          .map(async (dataOobj) => {
            console.debug(`collectors/collectStats.js: New or Updated Snap, Publishing to pubsub: ${dataOobj.snap.package_name}`);
            const data = Buffer.from(JSON.stringify(dataOobj), "utf8");
            try {
              await snapsSnapshotPubsubTopic.publishMessage({data});
            } catch (e) {
              return console.error(`pubsub/snapsSnapshot.js: Error: New or Updated Snap PubSub publish: ${e}`);
            }
          });

      await Promise.allSettled(promises);
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
