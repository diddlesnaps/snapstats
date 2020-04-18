import {LastUpdatedModel} from '../models/LastUpdated';

export const updateLastUpdated = async (date) => {
    const lastUpdatedDoc = (await LastUpdatedModel.findOne()) || new LastUpdatedModel({date});
    lastUpdatedDoc.date = date;
    await lastUpdatedDoc.save();
};