import { Schema, model} from "mongoose";

const LastUpdatedSchema = new Schema({
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

export const LastUpdatedModel = model("LastUpdated", LastUpdatedSchema);
