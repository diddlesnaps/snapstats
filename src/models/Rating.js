import { Schema, model} from "mongoose";

const RatingsSchema = new Schema({
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

export const RatingsModel = model("Ratings", RatingsSchema);
