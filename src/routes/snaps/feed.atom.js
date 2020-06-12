import feed from './_feed';

export async function get(req, res, next) {
    try {
        res.end((await feed()).atom1());
    } catch(e) {
        console.log(e);
        return res.status(500).end();
    }
}
