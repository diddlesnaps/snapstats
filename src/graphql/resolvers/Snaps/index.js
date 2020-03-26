import { SnapsModel } from "../../../models/Snaps";
import { RatingsModel } from "../../../models/Rating";
import { LastUpdatedModel } from '../../../models/LastUpdated';
import escapeRegExp from 'lodash.escaperegexp';

const snapsByDateFn = (snapshot_date) => {
    return SnapsModel.find({ snapshot_date });
};

const searchSnapsFn = (args, snapshot_date) => {
    let query = { snapshot_date, $and: [] }

    if (args.name) {
        const name = escapeRegExp(args.name)

        query.$and.push({$or: [
            {name: {$regex: name, $options: 'i'}},
            {title: {$regex: name, $options: 'i'}},
            {package_name: {$regex: name, $options: 'i'}},
        ]})
    }

    if (args.publisherOrDeveloper) {
        const publisherOrDeveloper = escapeRegExp(args.publisherOrDeveloper)

        let publisherOrDeveloperQuery = []
        publisherOrDeveloperQuery.push({publisher: {$regex: publisherOrDeveloper, $options: 'i'}})
        publisherOrDeveloperQuery.push({developer_name: {$regex: publisherOrDeveloper, $options: 'i'}})

        query.$and.push({$or: [publisherOrDeveloperQuery]})
    }

    if (args.base) {
        query.$and.push({base_snap: args.base})
    }
    if (args.architecture) {
        query.$and.push({architecture: args.architecture})
    }
    if (args.categories) {
        query.$and.push({categories: {$in: args.categories}})
    }
    if (args.license) {
        query.$and.push({license: args.license})
    }

    if (typeof args.developerValidated !== 'undefined') {
        if (args.developerValidated === true) {
            query.$and.push({developer_validation: 'verified'})
        } else {
            query.$and.push({developer_validation: 'unproven'})
        }
    }

    return SnapsModel.find(query);
}

const findSnapsQueryFn = (searchHandlerFn) => async (_, args) => {
    const updated = await LastUpdatedModel.findOne({});
    if (!updated) {
        return null
    }
    return await searchHandlerFn(args, updated.date)
    .skip(args.query.offset || 0)
    .limit(args.query.limit || 6)
}

const findSnapsCountFn = (searchSnapsFn) => async (_, args) => {
    const updated = await LastUpdatedModel.findOne({});
    if (!updated) {
        return null
    }
    return {
        count: (await searchSnapsFn(args, updated.date).countDocuments()) || 0,
    }
}

export default {
    Query: {
        findSnaps: findSnapsQueryFn(searchSnapsFn),
        findSnapsCount: findSnapsCountFn(searchSnapsFn),
        findSnapsByName: findSnapsQueryFn(searchSnapsFn),
        findSnapsByNameCount: findSnapsCountFn(searchSnapsFn),
        findSnapsByBase: findSnapsQueryFn(searchSnapsFn),
        findSnapsByBaseCount: findSnapsCountFn(searchSnapsFn),
        snapByName: async (_, args) => {
            const updated = await LastUpdatedModel.findOne({});
            if (!updated) {
                return null
            }
            return await SnapsModel.findOne({
                snapshot_date: updated.date,
                package_name: args.name
            })
        },
        snapById: async (_, args) => {
            const updated = await LastUpdatedModel.findOne({});
            if (!updated) {
                return null
            }
            return await SnapsModel.findOne({
                snapshot_date: updated.date,
                snap_id: args.snap_id
            })
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
