import * as functions from 'firebase-functions';

export * from './pubsub';
export * from './collectors';

import {sitemap as sitemapFunc} from '../sitemap';

export const sitemap = functions.runWith({
    timeoutSeconds: 30,
    memory: '256MB',
}).https.onRequest(sitemapFunc);
