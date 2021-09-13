// @ts-check

import { DeveloperCountsModel } from "../../../models/DeveloperCount";
import { SnapsModel } from "../../../models/Snaps";
import { LastUpdatedModel } from '../../../models/LastUpdated';
import { documentCount } from '../documentCount';

export default {
    Query: {
        developerCount: (_, args) => DeveloperCountsModel.findOne(args),
        developerCountCount: () => documentCount(DeveloperCountsModel),
        developerCounts: (_, args) => DeveloperCountsModel.find({}).sort({date: 'desc'}).skip(args.query.offset).limit(args.query.limit),
        developerCountsByDate: async (_, args) => {
            const updated = await LastUpdatedModel.findOne({});
            if (!updated) {
                return [];
            }
            const date = updated.date;
            const developerCounts = await DeveloperCountsModel.find({ date });
            return [{ _id: date, developerCounts }];
        },
        developerCountTimeline: (_, args) => DeveloperCountsModel.aggregate([
            { $match: {
                'date': {
                    '$gte': args.from ?
                        new Date(args.from) :
                        new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
                },
            } },
            { '$group': {
                '_id': {
                    'year': { '$year': '$date' },
                    'week': { '$week': '$date' },
                },
                'total': { '$max': '$total' },
                'mean': { '$avg': '$mean' },
            } },
            { '$project': {
                '_id': { '$dateToString': {
                    'date': {
                        '$dateFromParts': {
                            'isoWeekYear': '$_id.year',
                            'isoWeek': '$_id.week',
                        },
                    },
                    'format': '%Y-%m-%d',
                } },
                'total': 1,
                'mean': 1,
            } },
            { '$sort': { '_id': 1 } },
        ]),

        verifiedDevelopers: async () => {
            return SnapsModel.aggregate([
                { $match: {
                    developer_validation: 'verified',
                } },
                { $group: {
                    _id: {
                        developer_name: '$developer_name',
                        publisher_username: '$publisher_username',
                    }
                } },
                { $project: {
                    _id: '$_id.developer_name',
                    publisher_username: '$_id.publisher_username',
                } },
                { $sort: {
                    _id: 1,
                } },
            ])
        },
        verifiedDeveloperCount: async (_, args) => {
            const developerCounts = await SnapsModel.aggregate([
                { $match: {
                    developer_validation: 'verified',
                } },
                { $group: {
                    _id: 'count',
                    uniqueDevelopers: { $addToSet: '$developer_name' }
                } },
                { $project: { count: { $size: '$uniqueDevelopers' } } }
            ])
            if (developerCounts.length === 0) {
                return {count: 0}
            }

            const {count} = developerCounts.shift()
            return {count}
        },
    },
};