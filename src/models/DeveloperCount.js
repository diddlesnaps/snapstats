import { Schema, model} from "mongoose";

const DeveloperCountsSchema = new Schema({
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
});

export const DeveloperCountsModel = model("DeveloperCounts", DeveloperCountsSchema);
