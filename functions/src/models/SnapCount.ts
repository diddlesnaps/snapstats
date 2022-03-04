import mongoose, {Document, Model} from "mongoose";
const {Schema, model} = mongoose;

export interface ISnapCountsDocument extends Document {
    total: number
    filtered: number
    date: Date
    isDaily: boolean
}

const SnapCountsSchema = new Schema<ISnapCountsDocument>({
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
    default: () => new Date(),
  },
  isDaily: {
    type: Boolean,
    default: false,
  },
});

export type ISnapCountsModel = Model<ISnapCountsDocument>
export const SnapCountsModel = model<ISnapCountsDocument, ISnapCountsModel>("SnapCount", SnapCountsSchema);
