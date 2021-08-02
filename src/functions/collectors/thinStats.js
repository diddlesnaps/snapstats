// @ts-check

import * as functions from 'firebase-functions';
import {ArchitecturesModel} from '../../models/Architecture';
import {BasesModel} from '../../models/Base';
import {ChannelsModel} from '../../models/Channel';
import {ConfinementsModel} from '../../models/Confinement';
import {DeveloperCountsModel} from '../../models/DeveloperCount';
import {LicensesModel} from '../../models/License';
import {SectionsModel} from '../../models/Section';
import {SnapCountsModel} from '../../models/SnapCount';

import {promisify} from '../../promisify';
import { connectMongoose } from '../../mongodb';
import {Model} from 'mongoose';

const denysave = process.env.denysave === 'true' ? true : false;

/** @type {(context: functions.EventContext) => Promise<void>} */
export default async (context) => {
    try {
        console.log(`Thinning stats at ${(new Date()).toLocaleString()}`);
        
        if (!denysave) {
            await connectMongoose();

            let promises = [];
            /** @type Model */
            let model;
            for (model of [
                ArchitecturesModel,
                BasesModel,
                ChannelsModel,
                ConfinementsModel,
                DeveloperCountsModel,
                LicensesModel,
                SectionsModel,
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
