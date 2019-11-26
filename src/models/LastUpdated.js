import { Schema, model} from "mongoose";

const LastUpdatedSchema = new Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    dailyDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

export const LastUpdatedModel = model("LastUpdated", LastUpdatedSchema);
