// @ts-check

import fetch from 'node-fetch';

import {RatingsModel} from '../../models/Rating';
import { connectMongoose } from '../../mongodb';

const denysave = process.env.denysave === 'true' ? true : false;

export default async (context) => {
    const url = `https://odrs.gnome.org/1.0/reviews/api/ratings`;
    try {
        const res = await fetch(url, {
            method: 'GET',
        });
        const data = await res.json();

        const tasks = Object.keys(data).map(app_id => (
            {
                updateOne: {
                    filter: { app_id },
                    update: {
                        app_id,
                        ...data[app_id],
                    },
                    upsert: true,
                }
            }
        ));

        if (!denysave) {
            connectMongoose();
            await RatingsModel.bulkWrite(tasks)
        }
    } catch(err) {
        console.error(err.toString());
    }
};
