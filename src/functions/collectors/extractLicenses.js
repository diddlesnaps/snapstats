// @ts-check

import { connectMongoose } from '../../mongodb.js';
import {SnapsModel} from '../../models/Snaps.js';
import {LicensesModel} from '../../models/License.js';
import { sort, extractCombinedLicenseCounts, mapCounts } from '../../statsHelpers.js';
import { promisify } from '../../promisify.js';

const getCounts = items => {
    const item_names = new Set(items.map(item => item.name))
    /** @type {{[key: string]: number}} */
    const item_counts = {};
    for (const name of item_names) {
        const this_item = items.find(el => el.name === name)
        item_counts[name] = this_item.count;
    }

    return item_counts
}
const collector = (isDaily = false) => async (context) => {
    const date = Date.now();

    const addDate = (dateKey = null) => (data) => {
        const key = dateKey || 'date';
        return { ...data, [key]: date };
    };
    const addIsDaily = (data) => {
        return { ...data, isDaily };
    }

    await connectMongoose();

    const snap_licenses  = await promisify(SnapsModel.aggregate([
        { $group: {
            '_id': '$license',
            'count': { $sum: 1 },
        } },
        { $project: {
            'name': '$_id',
            'count': '$count',
            '_id': 0,
        } },
    ]))

    const license_counts = extractCombinedLicenseCounts(getCounts(snap_licenses))
    const licenses       = sort(Object.keys(license_counts).map(mapCounts(license_counts)));

    try {
        await LicensesModel.insertMany(
            licenses.map(license => (license.name) ? license : { ...license, name: 'unset' })
            .map(addDate())
            .map(addIsDaily)
        )
    } catch (err) {
        console.error(`collectors/extractLicenses.js: Error: licenses: ${err.toString()}`)
    }
}

export const hourly = collector(false)
export const daily = collector(true);