// @ts-check

import { Schema, model} from "mongoose";

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

export const SectionsModel = model("Sections", SectionsSchema);
