import { Schema, model} from "mongoose";

const LicensesSchema = new Schema({
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
});

export const LicensesModel = model("Licenses", LicensesSchema);
