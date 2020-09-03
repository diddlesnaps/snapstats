import { Schema, model, Document, Model } from "mongoose";

export interface ILicenseDocument extends Document {
    name: string
    count: number
    date: Date
    isDaily: boolean
}

const LicensesSchema = new Schema<ILicenseDocument>({
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

export interface ILicenseModel extends Model<ILicenseDocument> {}
export const LicensesModel = model<ILicenseDocument, ILicenseModel>("Licenses", LicensesSchema);
