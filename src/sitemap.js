import { createSitemap, EnumChangefreq } from 'sitemap';
import { SnapsModel } from './models/Snaps';

export const sitemap = async (req, res) => {
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
        return res.end(createSitemap({
            hostname: 'https://snapstats.org',
            cacheTime: 86400,
            urls,
        }).toXML());
    } catch(e) {
        console.log(e);
        return res.status(500).end();
    }
};
