import {ArchitecturesModel} from '../models/Architecture';
import {BasesModel} from '../models/Base';
import {ChannelsModel} from '../models/Channel';
import {ConfinementsModel} from '../models/Confinement';
import {DeveloperCountsModel} from '../models/DeveloperCount';
import {LicensesModel} from '../models/License';
import {SnapCountsModel} from '../models/SnapCount';

import {promisify} from '../graphql/resolvers/promisify';

const denysave = process.env.denysave === 'true' ? true : false;

export const thinCounts = async () => {
    try {
        console.log(`Thinning Counts at ${(new Date()).toLocaleString()}`);

        const promises = [];
        if (!denysave) {
            for (const model of [
                ArchitecturesModel,
                BasesModel,
                ChannelsModel,
                ConfinementsModel,
                DeveloperCountsModel,
                LicensesModel,
                SnapCountsModel,
            ]) {
                promises.push(
                    model.find({ isDaily: { $ne: true } })
                    .then(docs => promisify(model.deleteMany({
                        _id: { $in: docs.map(doc => doc._id) },
                    })))
                );
            }

            await Promise.all(promises);
        }
        console.log(`Counts thinning completed at ${(new Date()).toLocaleString()}`);
    } catch (err) {
        console.error(err);
    }
}
