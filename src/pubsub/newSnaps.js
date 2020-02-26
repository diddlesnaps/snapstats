import * as functions from 'firebase-functions';
// import {URLSearchParams} from 'url';

import Twitter from 'twitter-lite'

// const fb_app_id = process.env.FB_APP_ID || functions.config().facebook.app_id
// const fb_app_secret = process.env.FB_APP_SECRET || functions.config().facebook.app_secret
// const fb_page_id = process.env.FB_PAGE_ID || functions.config().facebook.page_id
// const fb_page_token = process.env.FB_PAGE_TOKEN || functions.config().facebook.page_token

const twitter_consumer_key = process.env.TWIT_APP_ID || functions.config().twitter.consumer_key
const twitter_consumer_secret = process.env.TWIT_APP_SECRET || functions.config().twitter.consumer_secret
const twitter_access_token = process.env.TWIT_APP_ID || functions.config().twitter.access_token
const twitter_access_secret = process.env.TWIT_APP_SECRET || functions.config().twitter.access_secret

export const newSnapsSubscriber = async (data, context) => {
    const pubSubMessage = data;
    const jsonData = pubSubMessage.data
        ? JSON.parse(Buffer.from(pubSubMessage.data, 'base64').toString())
        : undefined;

    if (name) {
        console.log(`Publishing new snap: ${jsonData.name} (${jsonData.slug})`);
        const url = `https://snapstats.org/snaps/${jsonData.slug}`
        const body = `${jsonData.name} has just been added to the Snap Store`

        let promises = [];

        // if (fb_app_id && fb_app_secret && fb_page_id && page_token) {
        //     promises.push(fetch(`https://graph.facebook.com/v6.0/${fb_page_id}/feed`, {
        //         method: 'POST',
        //         body: new URLSearchParams({
        //             access_token: fb_page_token,
        //             link: url,
        //             message: body,
        //         }),
        //     }).catch(e => console.error(e)))
        // }

        if (twitter_consumer_key && twitter_consumer_secret
        && twitter_access_token && twitter_access_secret) {
            let twitter = new Twitter({
                consumer_key: twitter_consumer_key,
                consumer_secret: twitter_consumer_secret,
                access_token_key: twitter_access_token,
                access_token_secret: twitter_access_secret,
            })
            promises.push(twitter.post('statuses/update', {
                status: `${body}: ${url}`,
            }).catch(e => console.error(e)))
        }

        await Promise.allSettled(promises)
    }
}
