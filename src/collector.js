import {request} from 'gaxios';

import {promisify} from './graphql/resolvers/promisify';

import {ArchitecturesModel} from './models/Architecture';
import {BasesModel} from './models/Base';
import {ChannelsModel} from './models/Channel';
import {ConfinementsModel} from './models/Confinement';
import {DeveloperCountsModel} from './models/DeveloperCount';
import {LastUpdatedModel} from './models/LastUpdated';
import {LicensesModel} from './models/License';
import {RatingsModel} from './models/Rating';
import {SnapCountsModel} from './models/SnapCount';
import {SnapsModel} from './models/Snaps';

import getStats from './snapstore-api';

const denysave = process.env.denysave === 'true' ? true : false;

const updateLastUpdated = async (date) => {
    const lastUpdatedDoc = (await LastUpdatedModel.findOne()) || new LastUpdatedModel({date});
    lastUpdatedDoc.date = date;
    await lastUpdatedDoc.save();
};

export const collectStats = (isDaily) => async () => {
    const date = Date.now();
    console.log(`Updating stats at ${new Date(date).toLocaleString()}`);
    try {
        const stats = (await getStats()).shift();
        if (!stats) {
            throw new Error(`No data returned from getStats().`);
        }
        const {
            architectures,
            bases,
            channels,
            confinements,
            developer_counts,
            licenses,
            snap_counts,
        } = stats;
        let { snaps } = stats;

        const snapsByName = {};
        snaps.forEach((snap) => {
            if (!snap.name) {
                return;
            }
            const name = snap.name;
            if (snapsByName[name]) {
                const metaSnap = snapsByName[name];
                if (snap.architecture) {
                    if (metaSnap.architecture) {
                        metaSnap.architecture = [...metaSnap.architecture, ...snap.architecture];
                    } else {
                        metaSnap.architecture = snap.architecture;
                    }
                    snapsByName[name] = metaSnap;
                }
            } else {
                snapsByName[name] = snap;
            }
        });

        snaps = Object.keys(snapsByName).map((key) => {
            const snap = snapsByName[key];
            snap.architecture = [...new Set(snap.architecture)];
            return snap;
        });

        const addDate = (dateKey = null) => (data) => {
            const key = dateKey || 'date';
            return { ...data, [key]: date };
        };

        if (!denysave) {
            const promises = [
                ArchitecturesModel.insertMany(
                    architectures.map(architecture => (architecture.name) ? architecture : { ...architecture, name: 'unset' }).map(addDate())
                ).catch(err => console.error(`architectures: ${err.toString()}`)),
                BasesModel.insertMany(
                    bases.map(base => (base.name) ? base : { ...base, name: 'unset' }).map(addDate())
                ).catch(err => console.error(`bases: ${err.toString()}`)),
                ChannelsModel.insertMany(
                    channels.map(channel => (channel.name) ? channel : { ...channel, name: 'unset' }).map(addDate())
                ).catch(err => console.error(`channels: ${err.toString()}`)),
                ConfinementsModel.insertMany(
                    confinements.map(confinement => (confinement.name) ? confinement : { ...confinement, name: 'unset' }).map(addDate())
                ).catch(err => console.error(`confinements: ${err.toString()}`)),
                LicensesModel.insertMany(
                    licenses.map(license => (license.name) ? license : { ...license, name: 'unset' }).map(addDate())
                ).catch(err => console.error(`licenses: ${err.toString()}`)),
                SnapsModel.insertMany(
                    snaps.map(snap => (snap.name) ? snap : { ...snap, name: 'unset' }).map(addDate('snapshot_date'))
                ).catch(err => console.error(`snaps: ${err.toString()}`)),

                DeveloperCountsModel.insertMany(
                    [addDate()(developer_counts)]
                ).catch(err => console.error(`developerCounts: ${err.toString()}`)),
                SnapCountsModel.insertMany(
                    [addDate()(snap_counts)]
                ).catch(err => console.error(`snapCounts: ${err.toString()}`)),
            ];

            await Promise.all(promises);
            await updateLastUpdated(date);
        }
        // console.debug({
        //     architectures,
        //     bases,
        //     channels,
        //     confinements,
        //     licenses,
        //     developer_counts,
        //     snap_counts,
        // });
    } catch (err) {
        console.error(err.toString());
    }
    console.log(`Stats update completed at ${new Date().toLocaleString()}`);
};

export const collectRatings = async () => {
    const url = `https://odrs.gnome.org/1.0/reviews/api/ratings`;
    try {
        const res = await request({
            method: 'GET',
            url,
        });
        const data = res.data;

        const tasks = Object.keys(data).map(app_id => (
            {
                updateOne: {
                    filter: { app_id },
                    update: {
                        app_id,
                        ...data[app_id],
                    },
                    upsert: true,
                }
            }
        ));

        await RatingsModel.bulkWrite(tasks)
    } catch(err) {
        console.error(err.toString());
    }
};

const thinCounts = async (fromDate) => {
    try {
        const lastUpdatedDoc = await LastUpdatedModel.findOne();

        let date = Date.now() - 3600;
        let comparator = '$lt';
        if (lastUpdatedDoc) {
            date = lastUpdatedDoc.date;
            comparator = '$ne';
        }

        const promises = [];
        for (const model of [
            ArchitecturesModel,
            BasesModel,
            ChannelsModel,
            ConfinementsModel,
            LicensesModel,
        ]) {
            promises.push(
                model.find({ $and: [
                    { date: { $gt: fromDate } },
                    { date: { [comparator]: date } },
                ] })
                .then(docs => promisify(model.deleteMany({
                    _id: { $in: docs.map(doc => doc._id) },
                })))
            );
        }

        promises.push(
            DeveloperCountsModel.find({ $and: [
                { date: { $gt: fromDate } },
                { date: { [comparator]: date } },
            ] })
            .then(docs => promisify(DeveloperCountsModel.deleteMany({
                _id: { $in: docs.map(doc => doc._id) },
            })))

        );
        promises.push(
            SnapCountsModel.find({ $and: [
                { date: { $gt: fromDate } },
                { date: { [comparator]: date } },
            ] })
            .then(docs => promisify(SnapCountsModel.deleteMany({
                _id: { $in: docs.map(doc => doc._id) },
            })))
        );
        await Promise.all(promises);
    } catch (err) {
        console.error(err);
    }
}

const thinSnaps = async (fromDate) => {
    try {
        const lastUpdatedDoc = await LastUpdatedModel.findOne();

        let date = Date.now() - 3600;
        let comparator = '$lt';
        if (lastUpdatedDoc) {
            date = lastUpdatedDoc.date;
            comparator = '$ne';
        }

        const docsModel = await promisify(SnapsModel.find({
            $and: [
                { snapshot_date: { $gt: fromDate } },
                { snapshot_date: { [comparator]: date } },
            ],
        }));
        await promisify(SnapsModel.deleteMany({
            _id: { $in: docs.map(doc => doc._id) },
        }));
    } catch (err) {
        console.error(err);
    }
}

export const thinStats = async () => {
    try {
        const date = new Date();
        const fromDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
        console.log(`Thinning stats at ${date.toLocaleString()}`);
        if (!denysave) {
            const promises = [
                thinCounts(fromDate),
                thinSnaps(fromDate),
            ];
            await Promise.all(promises);
        }
        console.log(`Stats thinning completed at ${new Date().toLocaleString()}`);
    } catch (err) {
        console.error(err.toString());
    }
};
