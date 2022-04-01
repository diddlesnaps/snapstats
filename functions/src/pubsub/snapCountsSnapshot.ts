import { SnapCountsModel } from "../models/SnapCount";
import * as functions from "firebase-functions";
import { connectMongoose } from "../mongodb";

export default async (message: functions.pubsub.Message) => {
    try {
        await connectMongoose();
        await SnapCountsModel.insertMany(message.json);
    } catch (err) {
        console.error(`collectors/collectStats.js: Error: snapCounts: ${err.toString()}`);
    }
}
