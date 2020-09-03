import { Schema, model, Document, Model } from "mongoose";

export interface ILastUpdatedDocument extends Document {
    date: Date
}

const LastUpdatedSchema = new Schema<ILastUpdatedDocument>({
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

export interface ILastUpdatedModel extends Model<ILastUpdatedDocument> {}
export const LastUpdatedModel = model<ILastUpdatedDocument, ILastUpdatedModel>("LastUpdated", LastUpdatedSchema);
