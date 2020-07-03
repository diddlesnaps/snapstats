import { SnapsModel } from "../../../models/Snaps"
import { RatingsModel } from "../../../models/Rating"
import escapeRegExp from 'lodash.escaperegexp'
import {MongooseDataloaderFactory} from 'graphql-dataloader-mongoose';

const getRatingAverage = async (snap) => {
    const rating = await RatingsModel.findOne({
        app_id: `io.snapcraft.${snap._doc.package_name}-${snap._doc.snap_id}`,
    })
    if (!rating) {
        return 0;
    }
    const count = rating.total
    return (
            rating.star5 * 5
            + rating.star4 * 4
            + rating.star3 * 3
            + rating.star2 * 2
            + rating.star1
        ) / count;
}

const getRatingCount = async (snap) => {
    const rating = await RatingsModel.findOne({
        app_id: `io.snapcraft.${snap._doc.package_name}-${snap._doc.snap_id}`,
    })
    if (!rating) {
        return 0;
    }
    return rating.total;
}

const snapsByDateFn = () => SnapsModel.find({name: {$not: /(^(test|hello)-|-test$)/i}})

const searchSnapsFn = (args) => {
    let query = {}

    if (args.name) {
        const name = escapeRegExp(args.name)

        query = {
            ...query,
            name: { $not: /(^(test|hello)-|-test$)/i },
            $or: [
                { name: { $regex: name, $options: 'i' } },
                { title: { $regex: name, $options: 'i' } },
                { package_name: { $regex: name, $options: 'i' } },
            ],
        }
    }

    if (args.publisherOrDeveloper) {
        const publisherOrDeveloper = escapeRegExp(args.publisherOrDeveloper)

        let publisherOrDeveloperQuery: any[] = []
        publisherOrDeveloperQuery.push({publisher: {$regex: publisherOrDeveloper, $options: 'i'}})
        publisherOrDeveloperQuery.push({developer_name: {$regex: publisherOrDeveloper, $options: 'i'}})

        query = { ...query, $or: [publisherOrDeveloperQuery] }
    }

    if (args.base) {
        query = { ...query, base_snap: args.base }
    }
    if (args.architecture) {
        query = { ...query, architecture: args.architecture }
    }
    if (args.categories) {
        query = { ...query, categories: { $in: args.categories } }
    }
    if (args.license) {
        query = { ...query, license: args.license }
    }

    if (typeof args.developerValidated !== 'undefined') {
        if (args.developerValidated === true) {
            query = { ...query, developer_validation: 'verified' }
        } else {
            query = { ...query, developer_validation: 'unproven' }
        }
    }

    if (args.query && args.query.sort) {
        let sort = { [args.query.sort.field]: args.query.sort.order }
        return SnapsModel.find(query).sort(sort)
    }
    
    return SnapsModel.find(query)
}

const findSnapsQueryFn = (searchHandlerFn) => async (_, args) => {
    return await searchHandlerFn(args)
    .skip(args.query.offset || 0)
    .limit(args.query.limit || 6)
}

const findSnapsCountFn = (searchSnapsFn) => async (_, args) => {
    const count = (await searchSnapsFn(args).countDocuments()) || 0
    return { count }
}

const snapsByDateCount = async () => {
    return {
        count: (await snapsByDateFn().countDocuments()) || 0,
    }
};

export default {
    Query: {
        findSnaps: findSnapsQueryFn(searchSnapsFn),
        findSnapsCount: findSnapsCountFn(searchSnapsFn),
        findSnapsByName: async (parent, args, context) => {
            const dataloaderFactory: MongooseDataloaderFactory = context.dataloaderFactory;
            const snapNameLoader = dataloaderFactory.mongooseLoader(SnapsModel).dataloader('package_name');
            return snapNameLoader.loadMany(args.name);
        },
        findSnapsByNameCount: findSnapsCountFn(searchSnapsFn),
        findSnapsByBase: async (parent, args, context) => {
            const dataloaderFactory: MongooseDataloaderFactory = context.dataloaderFactory;
            const snapNameLoader = dataloaderFactory.mongooseLoader(SnapsModel).dataloader('base');
            return snapNameLoader.loadMany(args.base);
        },
        findSnapsByBaseCount: findSnapsCountFn(searchSnapsFn),
        snapByName: async (parent, args, context) => {
            const dataloaderFactory: MongooseDataloaderFactory = context.dataloaderFactory;
            const snapNameLoader = dataloaderFactory.mongooseLoader(SnapsModel).dataloader('package_name');
            return snapNameLoader.load(args.name);
        },
        snapById: async (parent, args, context) => {
            const dataloaderFactory: MongooseDataloaderFactory = context.dataloaderFactory;
            const snapNameLoader = dataloaderFactory.mongooseLoader(SnapsModel).dataloader('snap_id');
            return snapNameLoader.loadMany(args.snap_id);
        },
        snapsByDate: async (_, args) => {
            return await snapsByDateFn()
            .sort({'date_published': -1})
            .skip(args.query.offset || 0)
            .limit(args.query.limit || 6)
        },
        snapsByDateCount: snapsByDateCount,
        snapsByUpdatedDate: async (_, args) => {
            return await snapsByDateFn()
            .sort({'last_updated': -1})
            .skip(args.query.offset || 0)
            .limit(args.query.limit || 6)
        },
        snapsByUpdatedDateCount: snapsByDateCount,
    },
    Snap: {
        ratings_average: getRatingAverage,
        ratings_count: getRatingCount,
    }
};
