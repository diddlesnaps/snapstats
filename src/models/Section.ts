import { Schema, model, Document, Model } from "mongoose";

export interface ISectionDocument extends Document {
    name: string
    count: number
    date: Date
    isDaily: boolean
}

const SectionsSchema = new Schema({
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

export interface ISectionModel extends Model<ISectionDocument> {}
export const SectionsModel = model<ISectionDocument, ISectionModel>("Sections", SectionsSchema);
