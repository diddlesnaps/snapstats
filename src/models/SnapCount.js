// @ts-check

import { Schema, model} from "mongoose";

const SnapCountsSchema = new Schema({
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

export const SnapCountsModel = model("SnapCount", SnapCountsSchema);
