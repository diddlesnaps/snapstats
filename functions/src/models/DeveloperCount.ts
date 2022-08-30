import mongoose, {Document, Model} from "mongoose";
const {Schema, model} = mongoose;

export interface IDeveloperCountsDocument extends Document {
    total: number
    mean: number
    mode: number
    median: number
    date: Date
    isDaily: boolean
}

const DeveloperCountsSchema = new Schema<IDeveloperCountsDocument>({
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
    default: () => new Date(),
  },
  isDaily: {
    type: Boolean,
    default: false,
  },
});

export type ILastUpdatedModel = Model<IDeveloperCountsDocument>
export const DeveloperCountsModel =
  model<IDeveloperCountsDocument, ILastUpdatedModel>(
      "DeveloperCounts", DeveloperCountsSchema);
