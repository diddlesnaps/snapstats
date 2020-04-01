import { SnapsModel } from "../../../models/Snaps"
import { RatingsModel } from "../../../models/Rating"
import { LastUpdatedModel } from '../../../models/LastUpdated'
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

const snapsByDateFn = (snapshot_date) => SnapsModel.find({ snapshot_date })

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

    return SnapsModel.find(query)
}

const findSnapsQueryFn = (searchHandlerFn) => async (_, args) => {
    const updated = await LastUpdatedModel.findOne({})
    if (!updated) {
        return []
    }
    const snaps = await searchHandlerFn(args, updated.date)
    .skip(args.query.offset || 0)
    .limit(args.query.limit || 6)

    return snaps.map(async snap => ({
        ...snap._doc,
        ...await getRating(snap),
    }))
}

const findSnapsCountFn = (searchSnapsFn) => async (_, args) => {
    const updated = await LastUpdatedModel.findOne({})
    if (!updated) {
        return []
    }
    const count = (await searchSnapsFn(args, updated.date).countDocuments()) || 0
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
            const updated = await LastUpdatedModel.findOne({})
            if (!updated) {
                return []
            }
            const snap = await SnapsModel.findOne({
                snapshot_date: updated.date,
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
            const updated = await LastUpdatedModel.findOne({})
            if (!updated) {
                return []
            }
            const snap = await SnapsModel.findOne({
                snapshot_date: updated.date,
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
            const updated = await LastUpdatedModel.findOne({})
            if (!updated) {
                return []
            }
            const snaps = await snapsByDateFn(updated.date)
            .sort({'date_published': -1})
            .skip(args.query.offset || 0)
            .limit(args.query.limit || 6)

            return snaps.map(async snap => ({
                ...snap._doc,
                ...await getRating(snap),
            }))
        },
        snapsByDateCount: async () => {
            const updated = await LastUpdatedModel.findOne({})
            if (!updated) {
                return []
            }
            return {
                count: (await snapsByDateFn(updated.date).countDocuments()) || 0,
            }
        },
    },
};
