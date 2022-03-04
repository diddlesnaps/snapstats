import mongoose, {Document, Model} from "mongoose";
const {Schema, model} = mongoose;

export interface ISectionDocument extends Document {
    name: string
    count: number
    date: Date
    isDaily: boolean
}

const SectionsSchema = new Schema<ISectionDocument>({
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

export type ISectionModel = Model<ISectionDocument>
export const SectionsModel = model<ISectionDocument, ISectionModel>("Sections", SectionsSchema);
