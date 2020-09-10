// @ts-check

import { SitemapStream, streamToPromise, EnumChangefreq } from 'sitemap';
import { SnapsModel } from './models/Snaps';
import {connectMongoose} from './mongodb';

export const sitemap = async (req, res) => {
    connectMongoose();
    /** @type {{url: string, changefreq?: EnumChangefreq, lastmodISO?: string}[]} */
    const static_pages = [
        { url: '/', changefreq: EnumChangefreq.DAILY },
        { url: '/snaps', changefreq: EnumChangefreq.DAILY },
        { url: '/developers', changefreq: EnumChangefreq.DAILY },
        { url: '/architectures', changefreq: EnumChangefreq.DAILY },
        { url: '/bases', changefreq: EnumChangefreq.DAILY },
        { url: '/channels', changefreq: EnumChangefreq.DAILY },
        { url: '/confinements', changefreq: EnumChangefreq.DAILY },
        { url: '/licenses', changefreq: EnumChangefreq.DAILY },
    ];
    try {
        const snaps = await SnapsModel.find({}, { last_updated: 1, package_name: 1 });
        const urls = static_pages.concat(
            snaps
                .map(snap => {
                    snap.last_updated = snap.last_updated ? new Date(snap.last_updated) : new Date(0);
                    return snap;
                })
                .sort((a, b) => a.last_updated == b.last_updated ? 0 : (a.last_updated < b.last_updated ? 1 : -1))
                .map(snap => ({
                    url: `/snaps/${snap.package_name}`,
                    lastmodISO: snap.last_updated.toISOString(),
                })));
        res.setHeader('Content-Type', 'application/xml');
        const stream = new SitemapStream({ hostname: 'https://snapstats.org/' });
        urls.forEach( link => stream.write( link ) );
        stream.end();
        return res.end((await streamToPromise( stream )).toString());
    } catch(e) {
        console.log(e);
        return res.status(500).end();
    }
};
