import {LastUpdatedModel} from '../models/LastUpdated';
import {SnapsModel} from '../models/Snaps';

import {promisify} from '../graphql/resolvers/promisify';

const denysave = process.env.denysave === 'true' ? true : false;

export const thinSnaps = async () => {
    const date = new Date();
    const fromDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    console.log(`Thinning Snaps at ${date.toLocaleString()}`);
    try {
        const lastUpdatedDoc = await LastUpdatedModel.findOne();

        let date = Date.now() - 3600;
        let comparator = '$lt';
        if (lastUpdatedDoc) {
            date = lastUpdatedDoc.date;
            comparator = '$ne';
        }

        const docsModel = await promisify(SnapsModel.find({
            snapshot_date: { [comparator]: date },
        }));
        if (!denysave) {
            await promisify(SnapsModel.deleteMany({
                _id: { $in: docs.map(doc => doc._id) },
            }));
        }
    } catch (err) {
        console.error(err);
    }
    console.log(`Snaps thinning completed at ${new Date().toLocaleString()}`);
}
