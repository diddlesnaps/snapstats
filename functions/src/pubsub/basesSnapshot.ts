import { BasesModel } from "../models/Base";
import * as functions from "firebase-functions";
import { connectMongoose } from "../mongodb";

export default async (message: functions.pubsub.Message) => {
    try {
        await connectMongoose();
        await BasesModel.insertMany(message.json.map((base) => (base.name) ? base : {...base, name: "core"}));
    } catch (err) {
        console.error(`collectors/collectStats.js: Error: bases: ${err.toString()}`);
    }
}