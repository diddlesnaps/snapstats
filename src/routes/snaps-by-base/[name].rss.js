// @ts-check

import feed from './_feed';

export async function get(req, res, next) {
    try {
        res.end((await feed(req.params.base)).rss2());
    } catch(e) {
        console.log(e);
        return res.status(500).end();
    }
}
