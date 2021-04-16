// @ts-check

import { connectMongoose } from '../../mongodb.js';
import {SnapsModel} from '../../models/Snaps.js';
import {LicensesModel} from '../../models/License.js';
import { sort, extractCombinedLicenseCounts, getCounts, mapCounts } from '../../statsHelpers.js';

const collector = (isDaily = false) => async (context) => {
    const addDate = (dateKey = null) => (data) => {
        const key = dateKey || 'date';
        return { ...data, [key]: date };
    };
    const addIsDaily = (data) => {
        return { ...data, isDaily };
    }

    const date = Date.now();

    connectMongoose();

    const snaps          = await SnapsModel.find().select({license:1, _id:0})
    const license_counts = extractCombinedLicenseCounts(getCounts('license', snaps));
    const licenses       = sort(Object.keys(license_counts).map(mapCounts(license_counts)));

    await LicensesModel.insertMany(
        licenses.map(license => (license.name) ? license : { ...license, name: 'unset' })
        .map(addDate())
        .map(addIsDaily)
    ).catch(err => console.error(`collectors/extractLicenses.js: Error: licenses: ${err.toString()}`))
}

export const hourly = collector(false)
export const daily = collector(true);