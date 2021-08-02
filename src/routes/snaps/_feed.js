// @ts-check

import { Feed } from "feed";
import {connectMongoose} from '../../mongodb';
import Snaps from '../../graphql/resolvers/Snaps';

export default async function() {
    connectMongoose();
    const now = new Date();
    const feed = new Feed({
        title: "Latest Snap Packages",
        description: "The latest 20 Snap Packages to be added to the public Snap Store",
        id: "https://snapstats.org/",
        link: "https://snapstats.org/",
        language: "en",
        image: "https://snapstats.org/snapstats@2x.png",
        favicon: "https://snapstats.org/favicons/android-icon-512x512.png",
        copyright: "© 2020 Dani Llewellyn",
        updated: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        generator: "Snapstats.org",
        feedLinks: {
            json: "https://snapstats.org/snaps/feed.json",
            atom: "https://snapstats.org/snaps/feed.atom",
            rss: "https://snapstats.org/snaps/feed.rss"
        },
        author: {
            name: "Dani Llewellyn",
            email: "diddledani@ubuntu.com",
            link: "https://diddledani.com/"
        }
    });
    const snaps = await Promise.all(await Snaps.Query.snapsByDate(null, {query: {limit: 20}}));
    snaps.forEach(snap => {
        const url = `https://snapstats.org/snaps/${snap.package_name}`;
        feed.addItem({
            title: snap.title,
            id: url,
            link: url,
            description: snap.summary,
            content: snap.description,
            author: [
                {
                    name: snap.publisher,
                    link: snap.support_url
                }
            ],
            date: snap.date_published,
            image: snap.icon_url
        });
    });
    return feed;
}
