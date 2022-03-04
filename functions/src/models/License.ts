import mongoose, {Document, Model} from "mongoose";
const {Schema, model} = mongoose;

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
    default: "unset",
  },
  count: {
    type: Number,
    required: true,
    default: 0,
  },
  date: {
    type: Date,
    required: true,
    default: () => new Date(),
  },
  isDaily: {
    type: Boolean,
    default: false,
  },
});

export type ILicenseModel = Model<ILicenseDocument>
export const LicensesModel = model<ILicenseDocument, ILicenseModel>("Licenses", LicensesSchema);
