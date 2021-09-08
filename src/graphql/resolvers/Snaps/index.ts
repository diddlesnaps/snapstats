import { SnapsModel, ISnapDocument, DeveloperValidation, Architecture } from "../../../models/Snaps"
import { RatingsModel } from "../../../models/Rating"
import escapeRegExp from 'lodash.escaperegexp'
import type {FilterQuery, Aggregate} from 'mongoose';
import type {MongooseDataloaderFactory} from 'graphql-dataloader-mongoose';
import { promisify } from "../../../promisify";

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

type SearchFn = (args?: args) => any[]

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

const snapsByDateFn = () => SnapsModel.aggregate<ISnapDocument>([{ name: { $not: /(^(test|hello)-|-(test|hello)$)/i } }])

const searchSnapsFn = (args: args) => {
    let query: any[] = []
    let match: any = { name: { $not: /(^(test|hello)-|-(test|hello)$)/i } }

    if (args.name) {
        const name = escapeRegExp(args.name)

        query.push({
            $search: {
                index: 'default',
                text: {
                    query: name,
                    path: {
                        wildcard: '*'
                    }
                }
            },
        })
    }

    if (args.publisherOrDeveloper) {
        const publisherOrDeveloper: string = escapeRegExp(args.publisherOrDeveloper)

        let publisherOrDeveloperQuery: FilterQuery<ISnapDocument>[] = []
        publisherOrDeveloperQuery.push({publisher: {$regex: publisherOrDeveloper, $options: 'i'}})
        publisherOrDeveloperQuery.push({publisher_username: {$regex: publisherOrDeveloper, $options: 'i'}})
        publisherOrDeveloperQuery.push({developer_name: {$regex: publisherOrDeveloper, $options: 'i'}})

        match = { ...match, $or: publisherOrDeveloperQuery }
    }

    if (args.base) {
        match = { ...match, base_snap: args.base }
    }
    if (args.architecture) {
        match = { ...match, architecture: Architecture[args.architecture] }
    }
    if (args.categories) {
        match = { ...match, categories: { $in: args.categories } }
    }
    if (args.license) {
        match = { ...match, license: args.license }
    }

    if (typeof args.developerValidated !== 'undefined') {
        if (args.developerValidated === true) {
            match = { ...match, developer_validation: DeveloperValidation.verified }
        } else {
            match = { ...match, developer_validation: DeveloperValidation.unproven }
        }
    }

    query.push({ $match: match });

    let agg = SnapsModel.aggregate<ISnapDocument>(query)

    if (args.query?.sort?.field && args.query?.sort?.order) {
        agg = agg.sort({ [args.query.sort.field]: args.query.sort.order })
    }

    return agg
}

const findSnapsQueryFn = (searchHandlerFn: { (args: args): Aggregate<ISnapDocument[]> }) => (_: any, args: args) => {
    const agg = searchHandlerFn(args)
        .skip(args.query.offset ?? 0)
        .limit(args.query.limit ?? 6)
    return promisify(agg)
}

const findSnapsCountFn = (searchSnapsFn: { (args: args): Aggregate<ISnapDocument[]> }) => async (_: any, args: args) => (await promisify<{count: number}>(searchSnapsFn(args).count('count')))

const snapsByDateCount = async () => (await promisify<{count: number}[]>(snapsByDateFn().count('count'))).shift()

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

