import {request} from 'gaxios';

import {RatingsModel} from '../../models/Rating';

const denysave = process.env.denysave === 'true' ? true : false;

export default async () => {
    const url = `https://odrs.gnome.org/1.0/reviews/api/ratings`;
    try {
        const res = await request({
            method: 'GET',
            url,
        });
        const data = res.data;

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
            await RatingsModel.bulkWrite(tasks)
        }
    } catch(err) {
        console.error(err.toString());
    }
};
