import { SnapsModel, ISnapDocument, DeveloperValidation, Architecture } from "../../../models/Snaps"
import { RatingsModel } from "../../../models/Rating"
import escapeRegExp from 'lodash.escaperegexp'
import type {Query, FilterQuery} from 'mongoose';
import type {MongooseDataloaderFactory} from 'graphql-dataloader-mongoose';

type args = {
    query: {
        limit?: number
        offset?: number
        sort?: {
            field?: string
            order?: number
        }
    }
    name?: string
    package_name?: string
    publisherOrDeveloper?: string
    base?: string
    architecture?: string
    categories?: string[]
    license?: string
    developerValidated?: boolean
}

type SearchFn = (args?: args) => Query<ISnapDocument[], ISnapDocument>;

const getRatingAverage: (snap: ISnapDocument) => Promise<number> = async (snap) => {
    const rating = await RatingsModel.findOne({
        app_id: `io.snapcraft.${snap.package_name}-${snap.snap_id}`,
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

const getRatingCount: (snap: ISnapDocument) => Promise<number> = async (snap) => {
    const rating = await RatingsModel.findOne({
        app_id: `io.snapcraft.${snap.package_name}-${snap.snap_id}`,
    })
    if (!rating) {
        return 0;
    }
    return rating.total;
}

const snapsByDateFn: SearchFn = () => SnapsModel.find({ name: { $not: /(^(test|hello)-|-test$)/i } })

const searchSnapsFn: SearchFn = (args) => {
    let query: FilterQuery<ISnapDocument> = {}

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
        const publisherOrDeveloper: string = escapeRegExp(args.publisherOrDeveloper)

        let publisherOrDeveloperQuery: FilterQuery<ISnapDocument>[]
        publisherOrDeveloperQuery.push({publisher: {$regex: publisherOrDeveloper, $options: 'i'}})
        publisherOrDeveloperQuery.push({developer_name: {$regex: publisherOrDeveloper, $options: 'i'}})

        query = { ...query, $or: publisherOrDeveloperQuery }
    }

    if (args.base) {
        query = { ...query, base_snap: args.base }
    }
    if (args.architecture) {
        query = { ...query, architecture: Architecture[args.architecture] }
    }
    if (args.categories) {
        query = { ...query, categories: { $in: args.categories } }
    }
    if (args.license) {
        query = { ...query, license: args.license }
    }

    if (typeof args.developerValidated !== 'undefined') {
        if (args.developerValidated === true) {
            query = { ...query, developer_validation: DeveloperValidation.verified }
        } else {
            query = { ...query, developer_validation: DeveloperValidation.unproven }
        }
    }

    if (args.query?.sort?.field && args.query?.sort?.order) {
        let sort = { [args.query.sort.field]: args.query.sort.order }
        return SnapsModel.find(query).sort(sort)
    }
    
    return SnapsModel.find(query)
}

const findSnapsQueryFn = (searchHandlerFn: SearchFn) => async (_: any, args: args) => await searchHandlerFn(args)
    .skip(args.query.offset || 0)
    .limit(args.query.limit || 6)

const findSnapsCountFn = (searchSnapsFn: SearchFn) => async (_: any, args: args) => {
    const count = (await searchSnapsFn(args).countDocuments()) || 0;
    return { count };
}

const snapsByDateCount = async () => ({
    count: (await snapsByDateFn().countDocuments()) || 0,
});

const loadSnap = (key: string, argKey: string) => async (_parent: any, args: args, context: { dataloaderFactory: MongooseDataloaderFactory; }): Promise<ISnapDocument> => {
    const dataloaderFactory: MongooseDataloaderFactory = context.dataloaderFactory;
    const snapLoader = dataloaderFactory.mongooseLoader(SnapsModel).dataloader(key);
    return snapLoader.load(args[argKey]);
};
export default {
    Query: {
        findSnaps: findSnapsQueryFn(searchSnapsFn),
        findSnapsCount: findSnapsCountFn(searchSnapsFn),
        findSnapsByName: findSnapsQueryFn(searchSnapsFn),
        findSnapsByNameCount: findSnapsCountFn(searchSnapsFn),
        findSnapsByBase: findSnapsQueryFn(searchSnapsFn),
        findSnapsByBaseCount: findSnapsCountFn(searchSnapsFn),
        snapByName: loadSnap('package_name', 'name'),
        snapById: loadSnap('snap_id', 'snap_id'),
        snapsByDate: async (_: any, args: args) => await snapsByDateFn()
            .sort({ 'date_published': -1 })
            .skip(args.query.offset || 0)
            .limit(args.query.limit || 6),
        snapsByDateCount: snapsByDateCount,
        snapsByUpdatedDate: async (_: any, args: args) => await snapsByDateFn()
            .sort({ 'last_updated': -1 })
            .skip(args.query.offset || 0)
            .limit(args.query.limit || 6),
        snapsByUpdatedDateCount: snapsByDateCount,
    },
    Snap: {
        ratings_average: getRatingAverage,
        ratings_count: getRatingCount,
    }
};
