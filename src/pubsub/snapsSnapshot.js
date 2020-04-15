import * as functions from 'firebase-functions';
import {PubSub} from '@google-cloud/pubsub';
import {getDetails} from '../snapstore-api';
import {SnapsModel} from '../models/Snaps';

export const snapsSnapshotSubscriber = async (message) => {
    if (message.json && message.json.snap) {
        const {snapshot_date, details_api_url, isDaily} = message.json
        
        console.debug(`pubsub/snapsSnapshot.js: Running for Snap: ${message.json.snap.package_name}`)

        let details = {}
        try {
            details = (await getDetails(details_api_url)).snap
        } catch (e) {
            return console.error(`pubsub/snapsSnapshot.js: Unable to load Snap data from store API: ${e}`)
        }
        
        const snap = {
            ...details,
            ...message.json.snap,
            developer_validation: details.publisher.validation,
            publisher_username:   details.publisher.username,
            publisher:            details.publisher['display-name'],
            snapshot_date,
            isDaily,
        }

        try {
            await new SnapsModel.updateOne({package_name: snap.package_name}, snap)
        } catch (e) {
            return console.error(`pubsub/snapsSnapshot.js: Save Snap data error: ${e}`);
        }

        if (!snap.package_name.match(/(^(test|hello)-|-test$)/i) && (new Date(snap.date_published).getTime() / 1000) > message.json.prevDate) {
            console.debug(`pubsub/snapsSnapshot.js: New Snap, Publishing to pubsub: ${snap.package_name}`)
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
                return console.error(`pubsub/snapsSnapshot.js: New Snap PubSub publish error: ${e}`);
            }
        }
        console.debug(`pubsub/snapsSnapshot.js: Finished: ${snap.package_name}`)
    }
}