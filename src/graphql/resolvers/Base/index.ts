// @ts-check

import { BasesModel } from "../../../models/Base";
import { LastUpdatedModel } from '../../../models/LastUpdated';
import { documentCount } from '../documentCount';

export default {
    Query: {
        base: (_, args) => BasesModel.findOne(args),
        baseCount: () => documentCount(BasesModel),
        bases: (_, args) => BasesModel.find({}).sort({date: 'desc'}).skip(args.query.offset).limit(args.query.limit),
        basesByDate: async (_, args) => {
            const updated = await LastUpdatedModel.findOne({});
            if (!updated) {
                return [];
            }
            const date = updated.date;
            const bases = await BasesModel.find({ date });
            return [{ _id: date, bases }];
        },
        baseTimeline: (_, args) => BasesModel.aggregate([
            { $match: {
                'date': {
                    '$gte': args.from ?
                        new Date(args.from) :
                        new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
                },
            } },
            { '$sort': { 'date': 1 } },
            { $group: {
                '_id': {
                    'year': { '$year': '$date' },
                    'week': { '$week': '$date' },
                    'name': '$name',
                },
                'count': { '$max':'$count' },
            } },
            { $project: {
                '_id': {
                    '$dateFromParts': {
                        'isoWeekYear': '$_id.year',
                        'isoWeek': '$_id.week',
                    },
                },
                'count': 1,
                'name': '$_id.name',
            } },
            { $group: {
                '_id': '$name',
                'counts': {
                    '$push': {
                        'name': '$name',
                        'count': '$count',
                        'date': { '$dateToString': {
                            'date': '$_id',
                            'format': '%Y-%m-%d',
                        } },
                    }
                }
            } },
            { $project: {
                '_id': 1,
                'counts.count': 1,
                'counts.date': 1,
            } },
        ]),
    },
    // Mutation: {
    //     addBase: (_, {name, count}) => {
    //         const newBase = new BasesModel({ name, count });

    //         return new Promise((resolve, reject) => {
    //             newBase.save((err, res) => {
    //                 err ? reject(err) : resolve(res);
    //             });
    //         });
    //     },
    // },
};