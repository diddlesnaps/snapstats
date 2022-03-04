import mongoose, {Document, Model, Types} from "mongoose";
const {Schema, model} = mongoose;

export enum Architecture {
    amd64 = "amd64",
    i386 = "i386",
    arm64 = "arm64",
    armhf = "armhf",
    ppc64el = "ppc64el",
    s390x = "s390x",
    all = "all",
}
export enum Confinement {
    strict = "strict",
    devmode = "devmode",
    classic = "classic",
}
export enum DeveloperValidation {
    verified = "verified",
    unproven = "unproven",
}

type SnapAlias = {
    name: string
    target: string
};

type SnapMedia = {
    type: string
    url: string
    height: number
    width: number
};

type Plug = {
    plug_name: string
    interface: string
    content: string
    default_provider: string
}

type Slot = {
    slot_name: string
    interface: string
}

export interface ISnapDocument extends Document {
    aliases: Types.Array<SnapAlias>
    anon_download_url: string
    apps: Types.Array<string>
    architecture: Types.Array<Architecture>
    base_snap: string
    binary_filesize: number
    channel: string
    common_ids: Types.Array<string>
    confinement: Confinement
    contact: string
    date_published: Date
    description: string
    developer_id: string
    developer_name: string
    developer_validation: DeveloperValidation
    download_url: string
    icon_url: string
    last_updated: Date
    license: string
    media: Types.Array<SnapMedia>
    name: string
    origin: string
    package_name: string
    // prices: Map<string,number>
    private: boolean
    publisher: string
    publisher_username: string
    ratings_average: number
    release: Types.Array<string>
    revision: number
    screenshot_urls: Types.Array<string>
    sections: Types.Array<string>
    snap_id: string
    snap_yaml: string
    summary: string
    support_url: string
    title: string
    trending: boolean
    unlisted: boolean
    version: string
    website: string

    plugs: Types.Array<Plug>
    slots: Types.Array<Slot>
    snapshot_date: Date
    snapshotVersion: number
}

const SnapsSchema = new Schema<ISnapDocument>({
  aliases: {
    type: [{
      name: String,
      target: String,
    }],
  },
  anon_download_url: {
    type: String,
  },
  apps: {
    type: [String],
  },
  architecture: { // amd64, arm64, armhf, i386, ppc64el, s390x
    type: [String],
  },
  base_snap: { // base snap name
    type: String,
  },
  binary_filesize: {
    type: Number,
    default: -1,
  },
  channel: {
    type: String,
  },
  common_ids: {
    type: [String],
  },
  confinement: { // strict, classic, devmode
    type: String,
  },
  contact: { // free-form human-readable
    type: String,
  },
  date_published: {
    type: Date,
    required: true,
    default: () => new Date(),
  },
  description: { // markdown
    type: String,
  },
  developer_id: { // random
    type: String,
    required: true,
  },
  developer_name: { // human-readable
    type: String,
  },
  developer_validation: { // 'unproven' or 'verified'
    type: String,
  },
  download_url: {
    type: String,
  },
  icon_url: { // url
    type: String,
  },
  last_updated: {
    type: Date,
    required: true,
    default: () => new Date(),
  },
  license: { // SPDX text
    type: String,
  },
  media: {
    type: [{
      type: {type: String},
      url: {type: String},
      height: {type: Number},
      width: {type: Number},
    }],
  },
  name: { // namespaced name
    type: String,
    required: true,
    default: "unset",
  },
  origin: {
    type: String,
  },
  package_name: { // name
    type: String,
  },
  // prices: {
  //     type: Map,
  //     of: Number,
  // },
  private: {
    type: Boolean,
    default: false,
  },
  publisher: { // human-readable
    type: String,
    required: true,
  },
  publisher_username: {
    type: String,
  },
  ratings_average: {
    type: Number,
  },
  release: {
    type: [String],
  },
  revision: {
    type: Number,
  },
  screenshot_urls: { // urls
    type: [String],
  },
  sections: {
    type: [String],
  },
  snap_id: {
    type: String,
    required: true,
  },
  snap_yaml: {
    type: String,
    required: false,
    default: "",
    alias: "snap-yaml",
  },
  summary: { // human-readable
    type: String,
  },
  support_url: {
    type: String,
  },
  title: { // human-readable
    type: String,
  },
  trending: {
    type: Boolean,
    default: false,
  },
  unlisted: {
    type: Boolean,
    default: false,
  },
  version: {
    type: String,
  },
  website: { // url
    type: String,
  },


  // Snapstats.org stuff!
  plugs: {
    type: [{
      plug_name: {
        type: String,
        required: true,
      },
      interface: {
        type: String,
        required: true,
      },
      content: {
        type: String,
        required: false,
      },
      default_provider: {
        type: String,
        required: false,
        alias: "default-provider",
      },
    }],
    required: false,
  },
  slots: {
    type: [{
      slot_name: {
        type: String,
        required: true,
      },
      interface: {
        type: String,
        required: true,
      },
    }],
    required: false,
  },
  snapshot_date: {
    type: Date,
    required: true,
    default: () => new Date(),
  },
  snapshotVersion: {
    type: Number,
    required: true,
    default: 1,
  },
});

export type ISnapModel = Model<ISnapDocument>
export const SnapsModel = model<ISnapDocument, ISnapModel>("Snaps", SnapsSchema);
