import {ConfinementsModel} from "../models/Confinement";
import * as functions from "firebase-functions";
import {connectMongoose} from "../mongodb";

export default async (message: functions.pubsub.Message): Promise<void> => {
  try {
    await connectMongoose();
    await ConfinementsModel.insertMany(message.json.map((confinement) =>
        (confinement.name) ? confinement : {...confinement, name: "unset"}
    ));
  } catch (err) {
    console.error("collectors/collectStats.js: " +
        `Error: confinements: ${err.toString()}`);
  }
};
