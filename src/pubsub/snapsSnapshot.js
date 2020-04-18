import * as functions from 'firebase-functions';
import {PubSub} from '@google-cloud/pubsub';
import {getDetails} from '../snapstore-api';
import {SnapsModel} from '../models/Snaps';

export const snapsSnapshotSubscriber = async (message) => {
    if (message.json && message.json.snap) {
        const {prevSnapshotDate, details_api_url} = message.json
        let {snap} = message.json

        console.debug(`pubsub/snapsSnapshot.js: Running for Snap: ${snap.package_name}`)

        let details = {}
        try {
            details = (await getDetails(details_api_url))
        } catch (e) {
            return console.error(`collectors/collectStats.js: Error: Unable to load Snap data from store API: ${e}`)
        }

        const {snap: snapDetails, snap: {publisher}} = details

        snap = {
            ...snap,
            ...snapDetails,
            snapshotVersion,
            publisher:            publisher['display-name'],
            publisher_username:   publisher.username,
            developer_validation: publisher.validation,
        }

        try {
            const s = await SnapsModel.findOne({package_name: snap.package_name})
            if (s) {
                await s.update(snap)
            } else {
                await new SnapsModel(snap).save()
            }
        } catch (e) {
            return console.error(`collectors/collectStats.js: Error: Save Snap data: ${e}`, snap);
        }

        if (!snap.package_name.match(/(^(test|hello)-|-test$)/i) && (new Date(snap.date_published).getTime() / 1000) > snapshot_date) {
            console.debug(`collectors/collectStats.js: New Snap, Publishing to pubsub: ${snap.package_name}`)
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