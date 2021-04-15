// @ts-check

import {LastUpdatedModel} from '../../models/LastUpdated.js';

/** @type {(date: Date) => Promise<void>} */
export const updateLastUpdated = async (date) => {
    const lastUpdatedDoc = (await LastUpdatedModel.findOne()) || new LastUpdatedModel({date});
    lastUpdatedDoc.date = date;
    await lastUpdatedDoc.save();
};
