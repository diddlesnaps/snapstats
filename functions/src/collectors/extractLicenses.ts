import {connectMongoose} from "../mongodb.js";
import {SnapsModel} from "../models/Snaps.js";
import {LicensesModel} from "../models/License.js";
import {sort, extractCombinedLicenseCounts, mapCounts} from "../statsHelpers.js";

const getCounts = (items: {[key: string]: string | number}[]) => {
  const item_names: Set<string> = new Set(items.map((item) => item.name as string));
  /** @type {} */
  const item_counts: {[key: string]: number} = {};
  for (const name of item_names) {
    const this_item = items.find((el) => el.name === name);
    if (this_item) {
      item_counts[name] = this_item.count as number;
    }
  }

  return item_counts;
};
const collector = (isDaily = false) => async () => {
  const date = Date.now();

  const addDate = (dateKey: string | null = null) => (data: any) => {
    const key = dateKey || "date";
    return {...data, [key]: date};
  };
  const addIsDaily = (data: any) => {
    return {...data, isDaily};
  };

  await connectMongoose();

  const snap_licenses = await SnapsModel.aggregate([
    {$group: {
      "_id": "$license",
      "count": {$sum: 1},
    }},
    {$project: {
      "name": "$_id",
      "count": "$count",
      "_id": 0,
    }},
  ]);

  const license_counts = extractCombinedLicenseCounts(getCounts(snap_licenses));
  const licenses = sort(Object.keys(license_counts).map(mapCounts(license_counts)));

  try {
    await LicensesModel.insertMany(
        licenses.map((license) => (license.name) ? license : {...license, name: "unset"})
            .map(addDate())
            .map(addIsDaily)
    );
  } catch (err) {
    console.error(`collectors/extractLicenses.js: Error: licenses: ${err.toString()}`);
  }
};

export const hourly = collector(false);
export const daily = collector(true);
