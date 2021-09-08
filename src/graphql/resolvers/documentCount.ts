// @ts-check

import { LastUpdatedModel } from '../../models/LastUpdated';

export async function documentCount(model): Promise<{count: number}> {
    const updated = await LastUpdatedModel.findOne({});
    if (!updated) {
        return { count: 0 };
    }
    const date = updated.date;
    return { count: await model.find({date}).countDocuments() }
};
