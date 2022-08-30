import {SectionsModel} from "../models/Section";
import * as functions from "firebase-functions";
import {connectMongoose} from "../mongodb";

export default async (message: functions.pubsub.Message): Promise<void> => {
  try {
    await connectMongoose();
    await SectionsModel.insertMany(message.json.map(
        (section) => (section.name) ? section: {...section, name: "unset"}
    ));
  } catch (err) {
    console.error("collectors/collectStats.js: " +
        `Error: sections: ${err.toString()}`);
  }
};
