import { Schema, model, Document, Model } from "mongoose";

export interface IRatingDocument extends Document {
    app_id: string
    star0: number
    star1: number
    star2: number
    star3: number
    star4: number
    star5: number
    total: number
}

const RatingsSchema = new Schema<IRatingDocument>({
    app_id: {
        type: String,
        required: true,
        unique: true,
    },
    star0: {
        type: Number,
        required: true,
        default: 0,
    },
    star1: {
        type: Number,
        required: true,
        default: 0,
    },
    star2: {
        type: Number,
        required: true,
        default: 0,
    },
    star3: {
        type: Number,
        required: true,
        default: 0,
    },
    star4: {
        type: Number,
        required: true,
        default: 0,
    },
    star5: {
        type: Number,
        required: true,
        default: 0,
    },
    total: {
        type: Number,
        required: true,
        default: 0,
    },
});

export interface IRatingModel extends Model<IRatingDocument> {}
export const RatingsModel = model<IRatingDocument, IRatingModel>("Ratings", RatingsSchema);
