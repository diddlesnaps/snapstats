import {ChannelsModel} from "../models/Channel";
import * as functions from "firebase-functions";
import {connectMongoose} from "../mongodb";

export default async (message: functions.pubsub.Message): Promise<void> => {
  try {
    await connectMongoose();
    await ChannelsModel.insertMany(message.json.map((channel) =>
        (channel.name) ? channel : {...channel, name: "unset"}
    ));
  } catch (err) {
    console.error("collectors/collectStats.js: " +
        `Error: channels: ${err.toString()}`);
  }
};
