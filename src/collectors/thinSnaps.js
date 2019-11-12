import {SnapsModel} from '../models/Snaps';

import {promisify} from '../graphql/resolvers/promisify';

const denysave = process.env.denysave === 'true' ? true : false;

export const thinSnaps = async () => {
    try {
        console.log(`Thinning Snaps at ${(new Date()).toLocaleString()}`);

        if (!denysave) {
            await promisify(SnapsModel.deleteMany({ isDaily: { $ne: true } }));
        }
        console.log(`Snaps thinning completed at ${(new Date()).toLocaleString()}`);
    } catch (err) {
        console.error(err);
    }
}
