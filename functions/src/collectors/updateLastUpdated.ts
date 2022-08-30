import {LastUpdatedModel} from "../models/LastUpdated.js";

export const updateLastUpdated = async (date: Date): Promise<void> => {
  const lastUpdatedDoc =
      (await LastUpdatedModel.findOne()) ?? new LastUpdatedModel({date});
  lastUpdatedDoc.date = date;
  await lastUpdatedDoc.save();
};
