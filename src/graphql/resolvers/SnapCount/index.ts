import { SnapCountsModel, ISnapCountsDocument } from "../../../models/SnapCount";
import { LastUpdatedModel } from '../../../models/LastUpdated';
import { promisify } from '../../../promisify';
import { documentCount } from '../documentCount';

type args = {
    query: {
        limit?: number
        offset?: number
        sort?: {
            field?: string
            order?: number
        }
    },
    from: number,
}

export default {
    Query: {
        snapCount: (_: any, args: args) => promisify<ISnapCountsDocument>(SnapCountsModel.findOne(args)),
        snapCountCount: () => documentCount(SnapCountsModel),
        snapCounts: (_: any, args: args) => promisify<ISnapCountsDocument[]>(SnapCountsModel.find({}).sort({date: 'desc'}).skip(args.query.offset).limit(args.query.limit)),
        snapCountsByDate: async (_: any, args: args) => {
            const updated = await LastUpdatedModel.findOne({});
            if (!updated) {
                return [];
            }
            const date = updated.date;
            const snapCounts = await SnapCountsModel.find({ date });
            return [{ _id: date, snapCounts }];
        },
        snapCountTimeline: (_: any, args: args) => promisify<ISnapCountsDocument[]>(SnapCountsModel.aggregate<ISnapCountsDocument>([
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
                'filtered': { '$max': '$filtered' },
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
                'filtered': 1,
            } },
            { '$sort': { '_id': 1 } },
        ])),
    },
};