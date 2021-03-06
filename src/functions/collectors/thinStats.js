// @ts-check

import * as functions from 'firebase-functions';
import {ArchitecturesModel} from '../../models/Architecture';
import {BasesModel} from '../../models/Base';
import {ChannelsModel} from '../../models/Channel';
import {ConfinementsModel} from '../../models/Confinement';
import {DeveloperCountsModel} from '../../models/DeveloperCount';
import {LicensesModel} from '../../models/License';
import {SnapCountsModel} from '../../models/SnapCount';

import {promisify} from '../../graphql/resolvers/promisify';
import { connectMongoose } from '../../mongodb';

const denysave = process.env.denysave === 'true' ? true : false;

/** @type {(context: functions.EventContext) => Promise<void>} */
export default async (context) => {
    try {
        console.log(`Thinning stats at ${(new Date()).toLocaleString()}`);
        
        if (!denysave) {
            connectMongoose();

            let promises = [];
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

            await Promise.all(promises);
        }
        console.log(`Stats thinning completed at ${(new Date()).toLocaleString()}`);
    } catch (err) {
        console.error(err);
    }
}
