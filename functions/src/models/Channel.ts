import mongoose, {Document, Model} from "mongoose";
const {Schema, model} = mongoose;

export interface IChannelDocument extends Document {
    name: string
    count: number
    date: Date
    isDaily: boolean
}

const ChannelsSchema = new Schema<IChannelDocument>({
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

export type IChannelModel = Model<IChannelDocument>
export const ChannelsModel =
  model<IChannelDocument, IChannelModel>(
      "Channels", ChannelsSchema);
