import fetch from "node-fetch";

import {RatingsModel} from "../models/Rating";
import {connectMongoose} from "../mongodb";

const denysave = process.env.denysave === "true" ? true : false;

export default async () => {
  const url = "https://odrs.gnome.org/1.0/reviews/api/ratings";
  try {
    const res = await fetch(url, {
      method: "GET",
    });
    const data = await res.json() as {[key: string]: {star0: number, star1: number, star2: number, star3: number, star4: number, star5: number, total: number}};

    const tasks = Object.keys(data).map((app_id) => (
      {
        updateOne: {
          filter: {app_id},
          update: {
            app_id,
            ...data[app_id],
          },
          upsert: true,
        },
      }
    ));

    if (!denysave) {
      await connectMongoose();
      await RatingsModel.bulkWrite(tasks);
    }
  } catch (err) {
    console.error(err.toString());
  }
};
