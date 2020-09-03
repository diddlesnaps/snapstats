// @ts-check

import { Schema, model, Document, Model} from "mongoose";

export interface ISnapCountsDocument extends Document {
    total: number
    filtered: number
    date: Date
    isDaily: boolean
}

const SnapCountsSchema = new Schema<ISnapCountsDocument>({
    total: {
        type: Number,
        required: true,
        default: 0,
    },
    filtered: {
        type: Number,
        required: true,
        default: 0,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    isDaily: {
        type: Boolean,
        default: false,
    },
});

export interface ISnapCountsModel extends Model<ISnapCountsDocument> {}
export const SnapCountsModel = model<ISnapCountsDocument, ISnapCountsModel>("SnapCount", SnapCountsSchema);
