// @ts-check

import * as functions from 'firebase-functions';
import {PubSub} from '@google-cloud/pubsub';
// import jsYaml from 'js-yaml';
import {getDetails} from '../../snapstore-api';
import { connectMongoose } from '../../mongodb';
import {SnapsModel} from '../../models/Snaps';

import snapshotVersion from '../../snapshotVersion';

export default async (message) => {
    if (message.json && message.json.snap) {
        const {prevSnapshotDate, details_api_url} = message.json
        let {snap} = message.json

        console.debug(`pubsub/snapsSnapshot.js: Running for Snap: ${snap.package_name}`)

        let details = {}
        try {
            details = (await getDetails(details_api_url))
            if (!details?.snap?.publisher) {
                throw new Error(`snap publisher is undefined (${snap.package_name} from ${details_api_url})`)
            }
        } catch (e) {
            return console.error(`pubsub/snapsSnapshot.js: Error: Unable to load Snap data from store API: ${e}`)
        }

        const {snap: snapDetails, snap: {publisher}} = details

        // let plugs = {}, slots = {}
        // try {
        //     const yamlObj = jsYaml.safeLoad(yamlString)
        //     if (typeof yamlObj === 'object') {
        //         if ('plugs' in yamlObj) {
        //             plugs = yamlObj['plugs']
        //         }

        //         if ('slots' in yamlObj) {
        //             slots = yamlObj['slots']
        //         }

        //         if ('apps' in yamlObj) {
        //             Object.keys(yamlObj['apps']).forEach(
        //                 k => k['plugs'].forEach(
        //                     /** @param p {string} */
        //                     p => p in plugs || (plugs[p] = {interface: p})
        //                 ))
        //             Object.keys(yamlObj['apps']).forEach(
        //                 k => k['slots'].forEach(
        //                     /** @param s {string} */
        //                     s => s in slots || (slots[s] = {interface: s})
        //                 ))
        //         }
        //     }
        // } catch {}

        snap = {
            ...snap,
            ...snapDetails,
            // plugs: Object.keys(plugs).map(p => ({...plugs[p], plug_name: p})),
            // slots: Object.keys(slots).map(s => ({...slots[s], slot_name: s})),
            snapshotVersion,
            publisher:            publisher['display-name'],
            publisher_username:   publisher.username,
            developer_validation: publisher.validation,
        }

        try {
            connectMongoose();
            const s = await SnapsModel.findOne({package_name: snap.package_name})
            if (s) {
                await s.updateOne(snap)
            } else {
                await new SnapsModel(snap).save()
            }
        } catch (e) {
            return console.error(`pubsub/snapsSnapshot.js: Error: Save Snap data: ${e}`, snap);
        }

        if (!snap.package_name.match(/(^(test|hello)-|-test$)/i) && new Date(snap.date_published).getTime() > prevSnapshotDate) {
            console.debug(`pubsub/snapsSnapshot.js: New Snap, Publishing to PubSub: ${snap.package_name}`)

            const pubsub = new PubSub()
            const newSnapsPubsubTopic = pubsub.topic(functions.config().pubsub.newsnaps_topic)

            const data = {
                name: snap.title,
                slug: snap.package_name,
            }
            const dataBuffer = Buffer.from(JSON.stringify(data), 'utf8')
            try {
                await newSnapsPubsubTopic.publish(dataBuffer);
            } catch (e) {
                return console.error(`pubsub/snapsSnapshot.js: Error: New Snap PubSub publish: ${e}`);
            }
        }

        console.debug(`pubsub/snapsSnapshot.js: Finished: ${snap.package_name}`)
    }
}