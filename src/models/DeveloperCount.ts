import mongoose, {Document, Model} from 'mongoose'
const { Schema, model } = mongoose

export interface IDeveloperCountsDocument extends Document {
    total: number
    mean: number
    mode: number
    median: number
    date: Date
    isDaily: boolean
}

const DeveloperCountsSchema = new Schema<IDeveloperCountsDocument>({
    total: {
        type: Number,
        required: true,
        default: 0,
    },
    mean: {
        type: Number,
        required: true,
        default: 0,
    },
    mode: {
        type: Number,
        required: true,
        default: 0,
    },
    median: {
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

export const DeveloperCountsModel = model<IDeveloperCountsDocument, ILastUpdatedModel>("DeveloperCounts", DeveloperCountsSchema);
export interface ILastUpdatedModel extends Model<IDeveloperCountsDocument> {}
