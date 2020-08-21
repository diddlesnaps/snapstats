// @ts-check

import * as functions from 'firebase-functions';
import {PubSub} from '@google-cloud/pubsub';

import {ArchitecturesModel} from '../../models/Architecture';
import {BasesModel} from '../../models/Base';
import {ChannelsModel} from '../../models/Channel';
import {ConfinementsModel} from '../../models/Confinement';
import {DeveloperCountsModel} from '../../models/DeveloperCount';
import {LicensesModel} from '../../models/License';
import {SectionsModel} from '../../models/Section';
import {SnapCountsModel} from '../../models/SnapCount';
import {SnapsModel} from '../../models/Snaps';

import {getStats} from '../../snapstore-api';
import {updateLastUpdated} from './updateLastUpdated';
import {LastUpdatedModel} from '../../models/LastUpdated';

import snapshotVersion from '../../snapshotVersion';

const denysave = process.env.denysave === 'true' ? true : false;

const collector = (isDaily = false) => async (context) => {
    const date = Date.now();
    console.log(`Updating stats at ${new Date(date).toLocaleString()}`);
    try {
        const stats = (await getStats()).shift()
        if (!stats) {
            throw new Error(`No data returned from getStats().`);
        }
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

        console.debug(`collectors/collectStats.js: Mapping Snaps by package_name`)
        const snapsByName = {}
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
                            ...snap.architecture
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
            snap.sections = [...new Set(snap.sections.map(section => section.name))]
            return {
                snap,
                details_api_url,
            };
        });

        const addDate = (dateKey = null) => (data) => {
            const key = dateKey || 'date';
            return { ...data, [key]: date };
        };
        const addIsDaily = (data) => {
            return { ...data, isDaily };
        }

        if (denysave) {
            console.debug(`collectors/collectStats.js: NOT saving stats`)
        } else {
            console.debug(`collectors/collectStats.js: Saving stats`)
            let promises = [
                ArchitecturesModel.insertMany(
                    architectures.map(architecture => (architecture.name) ? architecture : { ...architecture, name: 'unset' })
                    .map(addDate())
                    .map(addIsDaily)
                ).catch(err => console.error(`collectors/collectStats.js: Error: architectures: ${err.toString()}`)),

                BasesModel.insertMany(
                    bases.map(base => (base.name) ? base : { ...base, name: 'core' })
                    .map(addDate())
                    .map(addIsDaily)
                ).catch(err => console.error(`collectors/collectStats.js: Error: bases: ${err.toString()}`)),

                ChannelsModel.insertMany(
                    channels.map(channel => (channel.name) ? channel : { ...channel, name: 'unset' })
                    .map(addDate())
                    .map(addIsDaily)
                ).catch(err => console.error(`collectors/collectStats.js: Error: channels: ${err.toString()}`)),

                ConfinementsModel.insertMany(
                    confinements.map(confinement => (confinement.name) ? confinement : { ...confinement, name: 'unset' })
                    .map(addDate())
                    .map(addIsDaily)
                ).catch(err => console.error(`collectors/collectStats.js: Error: confinements: ${err.toString()}`)),

                LicensesModel.insertMany(
                    licenses.map(license => (license.name) ? license : { ...license, name: 'unset' })
                    .map(addDate())
                    .map(addIsDaily)
                ).catch(err => console.error(`collectors/collectStats.js: Error: licenses: ${err.toString()}`)),

                SectionsModel.insertMany(
                    sections.map(section => (section.name) ? section: { ...section, name: 'unset' })
                    .map(addDate())
                    .map(addIsDaily)
                ).catch(err => console.error(`collectors/collectStats.js: Error: sections: ${err.toString()}`)),

                // SnapsModel.insertMany(
                //     snaps.map(snap => (snap.name) ? snap : { ...snap, name: 'unset' })
                //     .map(addDate('snapshot_date'))
                //     .map(addIsDaily)
                // ).catch(err => console.error(`collectors/collectStats.js: snaps: ${err.toString()}`)),

                DeveloperCountsModel.insertMany(
                    [addDate()(developer_counts)]
                    .map(addIsDaily)
                ).catch(err => console.error(`collectors/collectStats.js: Error: developerCounts: ${err.toString()}`)),

                SnapCountsModel.insertMany(
                    [addDate()(snap_counts)]
                    .map(addIsDaily)
                ).catch(err => console.error(`collectors/collectStats.js: Error: snapCounts: ${err.toString()}`)),
            ];
            
            await Promise.all(promises);

            console.debug(`collectors/collectStats.js: Publishing Snaps to snapshot PubSub topic`)

            let snapNames = new Set(snaps.map(snap => snap.package_name))
            let newNames  = new Set()

            if (!isDaily) {
                newNames = new Set(
                    await SnapsModel
                    .find({package_name: {$nin: [...snapNames]}})
                    .map(snap => snap.package_name)
                )
                snaps    = snaps.filter(snap => !newNames.has(snap.package_name))
            }

            snapNames = new Set([
                ...snapNames,
                ...newNames,
            ])

            const pubsub = new PubSub()
            const snapsSnapshotPubsubTopic = pubsub.topic(functions.config().pubsub.snaps_snapshot_topic)
            const {date: prevSnapshotDateObj} = await LastUpdatedModel.findOne() || {date: new Date()}
            const prevSnapshotDateTimestamp = prevSnapshotDateObj.getTime()

            promises = snaps
                .map(addDate('snapshot_date'))
                .map(addIsDaily)
                .map(data => ({...data, prevSnapshotDate: prevSnapshotDateTimestamp}))
                .filter(({snap: {last_updated, date_published}, prevSnapshotDate}) =>
                    (new Date(last_updated)).getTime() > prevSnapshotDate ||
                    (new Date(date_published)).getTime() > prevSnapshotDate)
                .map(async (data) => {
                    console.debug(`collectors/collectStats.js: New or Updated Snap, Publishing to pubsub: ${data.snap.package_name}`)
                    const dataBuffer = Buffer.from(JSON.stringify(data), 'utf8')
                    try {
                        await snapsSnapshotPubsubTopic.publish(dataBuffer);
                    } catch (e) {
                        return console.error(`pubsub/snapsSnapshot.js: Error: New or Updated Snap PubSub publish: ${e}`);
                    }
                })

            await Promise.all(promises);
            await SnapsModel.deleteMany({
                $or: [
                    {snapshotVersion: {$lt: snapshotVersion}},
                    {package_name: {$nin: [...snapNames]}},
                ]
            })
            await updateLastUpdated(date);
        }
    } catch (err) {
        console.error(`collectors/collectStats.js: Error: collectStats(): ${err}`);
    }
    console.log(`Stats update completed at ${new Date().toLocaleString()}`);
};

export const hourly = collector(false)
export const daily = collector(true);
