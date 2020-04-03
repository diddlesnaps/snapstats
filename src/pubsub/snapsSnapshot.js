import * as functions from 'firebase-functions';
import {PubSub} from '@google-cloud/pubsub';
import {getDetails} from '../snapstore-api';
import {SnapsModel} from '../models/Snaps';

export const snapsSnapshotSubscriber = async (message) => {
    if (message.json && message.json.snap) {
        const {snapshot_date, details_api_url, isDaily} = message.json
        let snap = {}
        try {
            snap = {
                ...(await getDetails(details_api_url)).snap,
                ...message.json.snap,
                snapshot_date,
                isDaily,
            }
        } catch (e) {
            return console.error(`pubsub/snapsSnapshot.js: Unable to load Snap data from store API: ${e}`)
        }

        try {
            await new SnapsModel(snap).save()
        } catch (e) {
            return console.error(`pubsub/snapsSnapshot.js: Save Snap data error: ${e}`);
        }

        if (new Date(snap.date_published) > message.json.prevDate) {
            const pubsub = new PubSub()
            const newSnapsPubsubTopic = pubsub.topic(functions.config().pubsub.newsnaps_topic)
            const data = {
                name: snap.title,
                slug: snap.package_name,
            }
            const dataBuffer = Buffer.from(JSON.stringify(data), 'utf8')
            try {
                return newSnapsPubsubTopic.publish(dataBuffer);
            } catch (e) {
                return console.error(`pubsub/snapsSnapshot.js: New Snap PubSub publish error: ${e}`);
            }
        }
    }
}