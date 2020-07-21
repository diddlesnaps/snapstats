"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Snaps_1 = require("../../../models/Snaps");
const Rating_1 = require("../../../models/Rating");
const lodash_escaperegexp_1 = __importDefault(require("lodash.escaperegexp"));
const getRatingAverage = async (snap) => {
    const rating = await Rating_1.RatingsModel.findOne({
        app_id: `io.snapcraft.${snap._doc.package_name}-${snap._doc.snap_id}`,
    });
    if (!rating) {
        return 0;
    }
    const count = rating.total;
    return (rating.star5 * 5
        + rating.star4 * 4
        + rating.star3 * 3
        + rating.star2 * 2
        + rating.star1) / count;
};
const getRatingCount = async (snap) => {
    const rating = await Rating_1.RatingsModel.findOne({
        app_id: `io.snapcraft.${snap._doc.package_name}-${snap._doc.snap_id}`,
    });
    if (!rating) {
        return 0;
    }
    return rating.total;
};
const snapsByDateFn = () => Snaps_1.SnapsModel.find({ name: { $not: /(^(test|hello)-|-test$)/i } });
const searchSnapsFn = (args) => {
    var _a, _b, _c, _d;
    let query = {};
    if (args.name) {
        const name = lodash_escaperegexp_1.default(args.name);
        query = {
            ...query,
            name: { $not: /(^(test|hello)-|-test$)/i },
            $or: [
                { name: { $regex: name, $options: 'i' } },
                { title: { $regex: name, $options: 'i' } },
                { package_name: { $regex: name, $options: 'i' } },
            ],
        };
    }
    if (args.publisherOrDeveloper) {
        const publisherOrDeveloper = lodash_escaperegexp_1.default(args.publisherOrDeveloper);
        let publisherOrDeveloperQuery = [];
        publisherOrDeveloperQuery.push({ publisher: { $regex: publisherOrDeveloper, $options: 'i' } });
        publisherOrDeveloperQuery.push({ developer_name: { $regex: publisherOrDeveloper, $options: 'i' } });
        query = { ...query, $or: [publisherOrDeveloperQuery] };
    }
    if (args.base) {
        query = { ...query, base_snap: args.base };
    }
    if (args.architecture) {
        query = { ...query, architecture: args.architecture };
    }
    if (args.categories) {
        query = { ...query, categories: { $in: args.categories } };
    }
    if (args.license) {
        query = { ...query, license: args.license };
    }
    if (typeof args.developerValidated !== 'undefined') {
        if (args.developerValidated === true) {
            query = { ...query, developer_validation: 'verified' };
        }
        else {
            query = { ...query, developer_validation: 'unproven' };
        }
    }
    if (((_b = (_a = args.query) === null || _a === void 0 ? void 0 : _a.sort) === null || _b === void 0 ? void 0 : _b.field) && ((_d = (_c = args.query) === null || _c === void 0 ? void 0 : _c.sort) === null || _d === void 0 ? void 0 : _d.order)) {
        let sort = { [args.query.sort.field]: args.query.sort.order };
        return Snaps_1.SnapsModel.find(query).sort(sort);
    }
    return Snaps_1.SnapsModel.find(query);
};
const findSnapsQueryFn = (searchHandlerFn) => async (_, args) => {
    return await searchHandlerFn(args)
        .skip(args.query.offset || 0)
        .limit(args.query.limit || 6);
};
const findSnapsCountFn = (searchSnapsFn) => async (_, args) => {
    const count = (await searchSnapsFn(args).countDocuments()) || 0;
    return { count };
};
const snapsByDateCount = async () => {
    return {
        count: (await snapsByDateFn().countDocuments()) || 0,
    };
};
const loadSnap = (key, argKey) => async (parent, args, context) => {
    const dataloaderFactory = context.dataloaderFactory;
    const snapLoader = dataloaderFactory.mongooseLoader(Snaps_1.SnapsModel).dataloader(key);
    return snapLoader.load(args[argKey]);
};
exports.default = {
    Query: {
        findSnaps: findSnapsQueryFn(searchSnapsFn),
        findSnapsCount: findSnapsCountFn(searchSnapsFn),
        findSnapsByName: findSnapsQueryFn(searchSnapsFn),
        findSnapsByNameCount: findSnapsCountFn(searchSnapsFn),
        findSnapsByBase: findSnapsQueryFn(searchSnapsFn),
        findSnapsByBaseCount: findSnapsCountFn(searchSnapsFn),
        snapByName: loadSnap('package_name', 'name'),
        snapById: loadSnap('snap_id', 'snap_id'),
        snapsByDate: async (_, args) => {
            return await snapsByDateFn()
                .sort({ 'date_published': -1 })
                .skip(args.query.offset || 0)
                .limit(args.query.limit || 6);
        },
        snapsByDateCount: snapsByDateCount,
        snapsByUpdatedDate: async (_, args) => {
            return await snapsByDateFn()
                .sort({ 'last_updated': -1 })
                .skip(args.query.offset || 0)
                .limit(args.query.limit || 6);
        },
        snapsByUpdatedDateCount: snapsByDateCount,
    },
    Snap: {
        ratings_average: getRatingAverage,
        ratings_count: getRatingCount,
    }
};
