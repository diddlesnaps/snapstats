import mongoose, {Document, Model} from "mongoose";
const {Schema, model} = mongoose;

export interface ILastUpdatedDocument extends Document {
    date: Date
}

const LastUpdatedSchema = new Schema<ILastUpdatedDocument>({
  date: {
    type: Date,
    required: true,
    default: () => new Date(),
  },
});

export type ILastUpdatedModel = Model<ILastUpdatedDocument>
export const LastUpdatedModel = model<ILastUpdatedDocument, ILastUpdatedModel>("LastUpdated", LastUpdatedSchema);
