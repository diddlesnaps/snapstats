import {ArchitecturesModel} from '../models/Architecture';
import {BasesModel} from '../models/Base';
import {ChannelsModel} from '../models/Channel';
import {ConfinementsModel} from '../models/Confinement';
import {DeveloperCountsModel} from '../models/DeveloperCount';
import {LastUpdatedModel} from '../models/LastUpdated';
import {LicensesModel} from '../models/License';
import {SnapCountsModel} from '../models/SnapCount';

import {promisify} from '../graphql/resolvers/promisify';

const denysave = process.env.denysave === 'true' ? true : false;

export const thinCounts = async () => {
    const date = new Date();
    const fromDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    console.log(`Thinning Counts at ${date.toLocaleString()}`);
    try {
        const lastUpdatedDoc = await LastUpdatedModel.findOne();

        let date = Date.now() - 3600;
        let comparator = '$lt';
        if (lastUpdatedDoc) {
            date = lastUpdatedDoc.date;
            comparator = '$ne';
        }

        const promises = [];
        if (!denysave) {
            for (const model of [
                ArchitecturesModel,
                BasesModel,
                ChannelsModel,
                ConfinementsModel,
                LicensesModel,
            ]) {
                promises.push(
                    model.find({ $and: [
                        { date: { $gt: fromDate } },
                        { date: { [comparator]: date } },
                    ] })
                    .then(docs => promisify(model.deleteMany({
                        _id: { $in: docs.map(doc => doc._id) },
                    })))
                );
            }

            promises.push(
                DeveloperCountsModel.find({ $and: [
                    { date: { $gt: fromDate } },
                    { date: { [comparator]: date } },
                ] })
                .then(docs => promisify(DeveloperCountsModel.deleteMany({
                    _id: { $in: docs.map(doc => doc._id) },
                })))
            );
            promises.push(
                SnapCountsModel.find({ $and: [
                    { date: { $gt: fromDate } },
                    { date: { [comparator]: date } },
                ] })
                .then(docs => promisify(SnapCountsModel.deleteMany({
                    _id: { $in: docs.map(doc => doc._id) },
                })))
            );
            await Promise.all(promises);
        }
    } catch (err) {
        console.error(err);
    }
    console.log(`Counts thinning completed at ${new Date().toLocaleString()}`);
}
