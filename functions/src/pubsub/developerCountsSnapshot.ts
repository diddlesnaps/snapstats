import { DeveloperCountsModel } from "../models/DeveloperCount";
import * as functions from "firebase-functions";
import { connectMongoose } from "../mongodb";

export default async (message: functions.pubsub.Message) => {
    try {
        await connectMongoose();
        await DeveloperCountsModel.insertMany(message.json);
    } catch (err) {
        console.error(`collectors/collectStats.js: Error: developerCounts: ${err.toString()}`);
    }
}
