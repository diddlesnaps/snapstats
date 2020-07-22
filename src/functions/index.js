import * as functions from 'firebase-functions';

export * from './pubsub';
export * from './collectors';

export const sitemap = functions.runWith({
    timeoutSeconds: 30,
    memory: '256MB',
}).https.onRequest(async (req, res) => (await import('../sitemap')).sitemap(req, res));
