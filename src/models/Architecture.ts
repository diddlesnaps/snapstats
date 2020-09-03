import { Schema, model, Document, Model } from "mongoose";

export interface IArchitectureDocument extends Document {
    name: string
    count: number
    date: Date
    isDaily: boolean
}

const ArchitecturesSchema = new Schema<IArchitectureDocument>({
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

export interface IArchitectureModel extends Model<IArchitectureDocument> {}
export const ArchitecturesModel = model<IArchitectureDocument, IArchitectureModel>("Architecture", ArchitecturesSchema);
