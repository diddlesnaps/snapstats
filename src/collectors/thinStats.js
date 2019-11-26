import {LastUpdatedModel} from '../models/LastUpdated';
import {SnapsModel} from '../models/Snaps';
import {promisify} from '../graphql/resolvers/promisify';
import {updateLastUpdated} from './updateLastUpdated';

const denysave = process.env.denysave === 'true' ? true : false;

export const thinSnaps = async () => {
    try {
        console.log(`Thinning stats at ${(new Date()).toLocaleString()}`);

        const lastUpdated = await LastUpdatedModel.findOne({});
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
                promises.push(promisify(model.deleteMany({ isDaily: { $ne: true } })));
            }

            promises.push(promisify(SnapsModel.deleteMany({ isDaily: { $ne: true } })));
            promises.push(updateLastUpdated(lastUpdated.dailyDate));
            await Promise.all(promises);
        }
        console.log(`Stats thinning completed at ${(new Date()).toLocaleString()}`);
    } catch (err) {
        console.error(err);
    }
}
