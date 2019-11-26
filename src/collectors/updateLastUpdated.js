import {LastUpdatedModel} from '../models/LastUpdated';

export const updateLastUpdated = async (date, isDaily = false) => {
    const lastUpdatedDoc = (await LastUpdatedModel.findOne()) || new LastUpdatedModel({date});
    if (isDaily) {
        lastUpdatedDoc.dailyDate = date;
    }
    lastUpdatedDoc.date = date;
    await lastUpdatedDoc.save();
};