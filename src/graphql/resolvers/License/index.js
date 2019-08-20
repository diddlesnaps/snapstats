import { LicensesModel } from "../../../models/License";
import { LastUpdatedModel } from '../../../models/LastUpdated';
import { promisify } from '../promisify';
import { documentCount } from '../documentCount';

export default {
    Query: {
        license: (_, args) => promisify(LicensesModel.findOne(args)),
        licenseCount: () => documentCount(LicensesModel),
        licenses: (_, args) => promisify(LicensesModel.find({}).sort({date: 'desc'}).skip(args.query.offset).limit(args.query.limit)),
        licensesByDate: async (_, args) => {
            const updated = await LastUpdatedModel.findOne({});
            if (!updated) {
                return [];
            }
            const date = updated.date;
            const licenses = await LicensesModel.find({ date });
            return [{ _id: date, licenses }];
        },
        licenseTimeline: (_, args) => promisify(LicensesModel.aggregate([
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
        ])),
    },
};