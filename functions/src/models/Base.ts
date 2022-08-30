import mongoose, {Document, Model} from "mongoose";
const {Schema, model} = mongoose;

export interface IBaseDocument extends Document {
    name: string
    count: number
    date: Date
    isDaily: boolean
}

const BasesSchema = new Schema<IBaseDocument>({
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

export type IBaseModel = Model<IBaseDocument>
export const BasesModel =
  model<IBaseDocument, IBaseModel>(
      "Bases", BasesSchema);
