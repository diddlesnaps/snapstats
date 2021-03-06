import { Schema, model, Document, Model } from "mongoose";

export interface IBaseDocument extends Document {
    name: string
    count: number
    date: Date
    isDaily: boolean
}

const BasesSchema = new Schema<IBaseDocument>({
    name: {
        type: String,
        required: true,
        default: 'unset',
    },
    count: {
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

export interface IBaseModel extends Model<IBaseDocument> {}
export const BasesModel = model<IBaseDocument, IBaseModel>("Bases", BasesSchema);
