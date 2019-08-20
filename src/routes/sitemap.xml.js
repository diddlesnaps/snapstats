import { createSitemap, EnumChangefreq } from 'sitemap';
import client from '../apollo';

import { gql } from 'apollo-boost'; 
const q = gql`
    query {
        snapsByDate(query:{limit:10000}){
            last_updated
            package_name
        }
    }
`;

export async function get(req, res, next) {
    const static_pages = [
        { url: '/', changefreq: EnumChangefreq.DAILY },
        { url: '/snaps', changefreq: EnumChangefreq.DAILY },
        { url: '/architectures', changefreq: EnumChangefreq.DAILY },
        { url: '/bases', changefreq: EnumChangefreq.DAILY },
        { url: '/channels', changefreq: EnumChangefreq.DAILY },
        { url: '/confinements', changefreq: EnumChangefreq.DAILY },
        { url: '/licenses', changefreq: EnumChangefreq.DAILY },
    ];
    try {
        let {data} = await await client.query({ query: q });
        if (!data) {
            return res.status(500).end();
        }

        let urls = static_pages.concat(
            data.snapsByDate.sort((a, b) => {
                if (a && a.last_updated && b && b.last_updated) {
                    return b.last_updated - a.last_updated
                } else {
                    return 0;
                }
            }).map(snap => ({
                url: `/snaps/${snap.package_name}`,
                lastmodISO: (snap.last_updated ? new Date(snap.last_updated) : new Date(0)).toISOString(),
            }))
        );
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
