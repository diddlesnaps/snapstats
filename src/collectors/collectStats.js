import * as functions from 'firebase-functions';
import {PubSub} from '@google-cloud/pubsub';

import {ArchitecturesModel} from '../models/Architecture';
import {BasesModel} from '../models/Base';
import {ChannelsModel} from '../models/Channel';
import {ConfinementsModel} from '../models/Confinement';
import {DeveloperCountsModel} from '../models/DeveloperCount';
import {LicensesModel} from '../models/License';
import {SectionsModel} from '../models/Section';
import {SnapCountsModel} from '../models/SnapCount';
import {SnapsModel} from '../models/Snaps';

import getStats from '../snapstore-api';
import {updateLastUpdated} from './updateLastUpdated';
import { LastUpdatedModel } from '../models/LastUpdated';

const denysave = process.env.denysave === 'true' ? true : false;

export const collectStats = (isDaily = false) => async () => {
    const date = Date.now();
    console.log(`Updating stats at ${new Date(date).toLocaleString()}`);
    try {
        const stats = (await getStats()).shift();
        if (!stats) {
            throw new Error(`No data returned from getStats().`);
        }
        const previousSnapshot = await LastUpdatedModel.findOne({})
        const {
            architectures,
            bases,
            channels,
            confinements,
            developer_counts,
            licenses,
            sections,
            snap_counts,
        } = stats;
        let { snaps } = stats;

        const snapsByName = {};
        snaps.forEach((snap) => {
            if (!snap.name) {
                return;
            }
            const name = snap.name;
            if (snapsByName[name]) {
                const metaSnap = snapsByName[name];
                if (snap.architecture) {
                    if (metaSnap.architecture) {
                        metaSnap.architecture = [...metaSnap.architecture, ...snap.architecture];
                    } else {
                        metaSnap.architecture = snap.architecture;
                    }
                    snapsByName[name] = metaSnap;
                }
            } else {
                snapsByName[name] = snap;
            }
        });

        snaps = Object.keys(snapsByName).map((key) => {
            const snap = snapsByName[key];
            snap.architecture = [...new Set(snap.architecture)];
            snap.sections = [...new Set(snap.sections.map(section => section.name))]
            return snap;
        });

        const addDate = (dateKey = null) => (data) => {
            const key = dateKey || 'date';
            return { ...data, [key]: date };
        };
        const addIsDaily = (data) => {
            return { ...data, isDaily };
        }

        if (!denysave) {
            let promises = [
                ArchitecturesModel.insertMany(
                    architectures.map(architecture => (architecture.name) ? architecture : { ...architecture, name: 'unset' })
                    .map(addDate())
                    .map(addIsDaily)
                ).catch(err => console.error(`architectures: ${err.toString()}`)),

                BasesModel.insertMany(
                    bases.map(base => (base.name) ? base : { ...base, name: 'core' })
                    .map(addDate())
                    .map(addIsDaily)
                ).catch(err => console.error(`bases: ${err.toString()}`)),

                ChannelsModel.insertMany(
                    channels.map(channel => (channel.name) ? channel : { ...channel, name: 'unset' })
                    .map(addDate())
                    .map(addIsDaily)
                ).catch(err => console.error(`channels: ${err.toString()}`)),

                ConfinementsModel.insertMany(
                    confinements.map(confinement => (confinement.name) ? confinement : { ...confinement, name: 'unset' })
                    .map(addDate())
                    .map(addIsDaily)
                ).catch(err => console.error(`confinements: ${err.toString()}`)),

                LicensesModel.insertMany(
                    licenses.map(license => (license.name) ? license : { ...license, name: 'unset' })
                    .map(addDate())
                    .map(addIsDaily)
                ).catch(err => console.error(`licenses: ${err.toString()}`)),

                SectionsModel.insertMany(
                    sections.map(section => (section.name) ? section: { ...section, name: 'unset' })
                    .map(addDate())
                    .map(addIsDaily())
                ).catch(err => console.error(`sections: ${err.toString()}`)),

                SnapsModel.insertMany(
                    snaps.map(snap => (snap.name) ? snap : { ...snap, name: 'unset' })
                    .map(addDate('snapshot_date'))
                    .map(addIsDaily)
                ).catch(err => console.error(`snaps: ${err.toString()}`)),

                DeveloperCountsModel.insertMany(
                    [addDate()(developer_counts)]
                    .map(addIsDaily)
                ).catch(err => console.error(`developerCounts: ${err.toString()}`)),

                SnapCountsModel.insertMany(
                    [addDate()(snap_counts)]
                    .map(addIsDaily)
                ).catch(err => console.error(`snapCounts: ${err.toString()}`)),
            ];

            await Promise.all(promises);
            await updateLastUpdated(date, isDaily);

            const pubsub = new PubSub()
            const newSnapsPubsubTopic = pubsub.topic(functions.config().pubsub.newsnaps_topic)

            await Promise.all(snaps
                .filter(snap => new Date(snap.date_published) > previousSnapshot.date)
                .map(async snap => {
                    const data = {
                        name: snap.title,
                        slug: snap.package_name,
                    }
                    const dataBuffer = Buffer.from(JSON.stringify(data), 'utf8')
                    try {
                        return newSnapsPubsubTopic.publish(dataBuffer);
                    } catch (e) {
                        return console.error(`New Snap PubSub publish error: ${e}`);
                    }
                }))
        }
    } catch (err) {
        console.error(err.toString());
    }
    console.log(`Stats update completed at ${new Date().toLocaleString()}`);
};
