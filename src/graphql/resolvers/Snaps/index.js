import { SnapsModel } from "../../../models/Snaps";
import { LastUpdatedModel } from '../../../models/LastUpdated';
import escapeRegExp from 'lodash.escaperegexp';

const snapsByDateFn = (snapshot_date) => {
    return SnapsModel.find({ snapshot_date });
};

const searchSnapsFn = (args, snapshot_date) => {
    const name = escapeRegExp(args.name)
    return SnapsModel.find({
        snapshot_date,
        $or: [
            { name: { $regex: name, $options: 'i' } },
            { title: { $regex: name, $options: 'i' } },
        ],
    });
};

export default {
    Query: {
        findSnapsByName: async (_, args) => {
            const updated = await LastUpdatedModel.findOne({});
            if (!updated) {
                return [];
            }
            return await searchSnapsFn(args, updated.date)
            .skip(args.query.offset || 0)
            .limit(args.query.limit || 6)
        },
        findSnapsByNameCount: async (_, args) => {
            const updated = await LastUpdatedModel.findOne({});
            if (!updated) {
                return [];
            }
            const count = await searchSnapsFn(args, updated.date).countDocuments();
            return {count}
        },
        snapByName: async (_, args) => {
            const updated = await LastUpdatedModel.findOne({});
            if (!updated) {
                return [];
            }
            const snaps = await SnapsModel.find({
                snapshot_date: updated.date,
                package_name: args.name
            })
            .skip(0)
            .limit(1);
            return snaps.shift();
        },
        snapById: async (_, args) => {
            const updated = await LastUpdatedModel.findOne({});
            if (!updated) {
                return [];
            }
            const snaps = await SnapsModel.find({
                snapshot_date: updated.date,
                snap_id: args.snap_id
            })
            .skip(0)
            .limit(1);
            return snaps.shift();
        },
        snapsByDate: async (_, args) => {
            const updated = await LastUpdatedModel.findOne({});
            if (!updated) {
                return [];
            }
            return await snapsByDateFn(updated.date)
            .sort({'date_published': -1})
            .skip(args.query.offset || 0)
            .limit(args.query.limit || 6)
        },
        snapsByDateCount: async () => {
            const updated = await LastUpdatedModel.findOne({});
            if (!updated) {
                return [];
            }
            return {
                count: (await snapsByDateFn(updated.date).countDocuments()) || 0,
            };
        },
    },
};
