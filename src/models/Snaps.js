import { Schema, model} from "mongoose";

const SnapsSchema = new Schema({
    snap_id: {
        type: String,
        required: true,
    },
    common_ids: {
        type: String,
    },
    confinement: { // strict, classic, devmode
        type: String,
    },
    name: { // namespaced name
        type: String,
        required: true,
        default: 'unset',
    },
    base_snap: { // base snap name
        type: String,
    },
    package_name: { // name
        type: String,
    },
    title: { // human-readable
        type: String
    },
    summary: { // human-readable
        type: String,
    },
    description: { // markdown
        type: String
    },
    architecture: { // amd64, arm64, armhf, i386, ppc64el, s390x
        type: [String],
    },
    website: { // url
        type: String,
    },
    contact: { // free-form human-readable
        type: String,
    },
    version: {
        type: String,
    },
    icon_url: { // url
        type: String,
    },
    screenshot_urls: { // urls
        type: [String],
    },
    ratings_average: {
        type: Number,
    },
    prices: {
        type: Map,
        of: Number,
    },
    license: { // SPDX text
        type: String,
    },
    developer_id: { // random
        type: String,
        required: true,
    },
    developer_validation: { // 'unproven' or 'verified'
        type: String,
    },
    publisher: { // human-readable
        type: String,
        required: true,
    },
    developer_name: { // human-readable
        type: String,
    },
    date_published: {
        type: Date,
        required: true,
        default: Date.now,
    },
    last_updated: {
        type: Date,
        required: true,
        default: Date.now,
    },
    snapshot_date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    categories: {
        type: [String],
    },
    isDaily: {
        type: Boolean,
        default: false,
    },
});

export const SnapsModel = model("Snaps", SnapsSchema);
