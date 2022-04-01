import { ArchitecturesModel } from "../models/Architecture";
import * as functions from "firebase-functions";
import { connectMongoose } from "../mongodb";

export default async (message: functions.pubsub.Message) => {
    try {
        await connectMongoose();
        await ArchitecturesModel.insertMany(message.json.map((architecture) => (architecture.name) ? architecture : {...architecture, name: "unset"}));
    } catch (err) {
        console.error(`collectors/collectStats.js: Error: architectures: ${err.toString()}`);
    }
}
