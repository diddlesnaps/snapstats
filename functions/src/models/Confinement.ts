import mongoose, {Document, Model} from "mongoose";
const {Schema, model} = mongoose;

export interface IConfinementDocument extends Document {
    name: string
    count: number
    date: Date
    isDaily: boolean
}

const ConfinementsSchema = new Schema<IConfinementDocument>({
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

export type IConfinementModel = Model<IConfinementDocument>
export const ConfinementsModel =
  model<IConfinementDocument, IConfinementModel>(
      "Confinements", ConfinementsSchema);
