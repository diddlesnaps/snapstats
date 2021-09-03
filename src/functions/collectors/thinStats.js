// @ts-check
import 'firebase-functions';
import { ArchitecturesModel } from '../../models/Architecture';
import { BasesModel } from '../../models/Base';
import { ChannelsModel } from '../../models/Channel';
import { ConfinementsModel } from '../../models/Confinement';
import { DeveloperCountsModel } from '../../models/DeveloperCount';
import { LicensesModel } from '../../models/License';
import { SnapCountsModel } from '../../models/SnapCount';
import { promisify } from '../../promisify';
import { connectMongoose } from '../../mongodb';
const denysave = process.env.denysave === 'true' ? true : false;
/** @type {(context: functions.EventContext) => Promise<void>} */
export default async (context) => {
    try {
        console.log(`Thinning stats at ${(new Date()).toLocaleString()}`);
        if (!denysave) {
            await connectMongoose();
            let promises = [];
            promises.push(promisify(ArchitecturesModel.deleteMany({ isDaily: { $ne: true } })));
            promises.push(promisify(BasesModel.deleteMany({ isDaily: { $ne: true } })));
            promises.push(promisify(ChannelsModel.deleteMany({ isDaily: { $ne: true } })));
            promises.push(promisify(ConfinementsModel.deleteMany({ isDaily: { $ne: true } })));
            promises.push(promisify(DeveloperCountsModel.deleteMany({ isDaily: { $ne: true } })));
            promises.push(promisify(LicensesModel.deleteMany({ isDaily: { $ne: true } })));
            promises.push(promisify(SnapCountsModel.deleteMany({ isDaily: { $ne: true } })));
            await Promise.all(promises);
        }
        console.log(`Stats thinning completed at ${(new Date()).toLocaleString()}`);
    }
    catch (err) {
        console.error(err);
    }
};
//# sourceMappingURL=thinStats.js.map