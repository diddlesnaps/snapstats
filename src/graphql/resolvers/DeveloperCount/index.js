import { DeveloperCountsModel } from "../../../models/DeveloperCount";
import { LastUpdatedModel } from '../../../models/LastUpdated';
import { promisify } from '../promisify';
import { documentCount } from '../documentCount';

export default {
    Query: {
        developerCount: (_, args) => promisify(DeveloperCountsModel.findOne(args)),
        developerCountCount: () => documentCount(DeveloperCountsModel),
        developerCounts: (_, args) => promisify(DeveloperCountsModel.find({}).sort({date: 'desc'}).skip(args.query.offset).limit(args.query.limit)),
        developerCountsByDate: async (_, args) => {
            const updated = await LastUpdatedModel.findOne({});
            if (!updated) {
                return [];
            }
            const date = updated.date;
            const developerCounts = await DeveloperCountsModel.find({ date });
            return [{ _id: date, developerCounts }];
        },
        developerCountTimeline: (_, args) => promisify(DeveloperCountsModel.aggregate([
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
        ])),
    },
};