import { createSitemap, EnumChangefreq } from 'sitemap';
import Snaps from '../graphql/resolvers/Snaps';

export async function get(req, res, next) {
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
        const snaps = await Promise.all(await Snaps.Query.snapsByUpdatedDate(null, {query:{limit:10000}}));
        const urls = static_pages.concat(
            snaps.map(snap => ({
                url: `/snaps/${snap.package_name}`,
                lastmodISO: (snap.last_updated ? new Date(snap.last_updated) : new Date(0)).toISOString(),
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
}
