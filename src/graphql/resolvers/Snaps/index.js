import { SnapsModel } from "../../../models/Snaps"
import { RatingsModel } from "../../../models/Rating"
import escapeRegExp from 'lodash.escaperegexp'

const getRating = async (snap) => {
    const rating = await RatingsModel.findOne({
        app_id: `io.snapcraft.${snap.package_name}-${snap.snap_id}`,
    })
    if (!rating) {
        return {
            ratings_average: 0,
            ratings_count: 0,
        }
    }
    const count = rating.total
    return {
        ratings_average: (
            rating.star5 * 5
            + rating.star4 * 4
            + rating.star3 * 3
            + rating.star2 * 2
            + rating.star1
        ) / count,
        ratings_count: count,
    }
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

        let publisherOrDeveloperQuery = []
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

    return SnapsModel.find(query)
}

const findSnapsQueryFn = (searchHandlerFn) => async (_, args) => {
    const snaps = await searchHandlerFn(args)
    .skip(args.query.offset || 0)
    .limit(args.query.limit || 6)

    return snaps.map(async snap => ({
        ...snap._doc,
        ...await getRating(snap),
    }))
}

const findSnapsCountFn = (searchSnapsFn) => async (_, args) => {
    const count = (await searchSnapsFn(args).countDocuments()) || 0
    return { count }
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
            const snap = await SnapsModel.findOne({
                package_name: args.name
            })

            if (!snap) {
                return null
            }

            return {
                ...snap._doc,
                ...await getRating(snap),
            }
        },
        snapById: async (_, args) => {
            const snap = await SnapsModel.findOne({
                snap_id: args.snap_id
            })

            if (!snap) {
                return null
            }

            return {
                ...snap._doc,
                ...await getRating(snap),
            }
        },
        snapsByDate: async (_, args) => {
            const snaps = await snapsByDateFn()
            .sort({'date_published': -1})
            .skip(args.query.offset || 0)
            .limit(args.query.limit || 6)

            return snaps.map(async snap => ({
                ...snap._doc,
                ...await getRating(snap),
            }))
        },
        snapsByDateCount: async () => {
            return {
                count: (await snapsByDateFn().countDocuments()) || 0,
            }
        },
    },
};
