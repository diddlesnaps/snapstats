// @ts-check

import { Schema, model} from "mongoose";

const SnapsSchema = new Schema({
    aliases: {
        type: [{
            name: String,
            target: String,
        }],
        default: [],
    },
    anon_download_url: {
        type: String,
    },
    apps: {
        type: [String],
        default: [],
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
        default: Date.now,
    },
    description: { // markdown
        type: String
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
        default: Date.now,
    },
    license: { // SPDX text
        type: String,
    },
    media: {
        type: [{
            type: { type: String },
            url: { type: String },
            height: { type: Number },
            width: { type: Number },
        }],
        default: [],
    },
    name: { // namespaced name
        type: String,
        required: true,
        default: 'unset',
    },
    origin: {
        type: String,
    },
    package_name: { // name
        type: String,
    },
    prices: {
        type: Map,
        of: Number,
    },
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
        type: Array,
        of: String,
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
        default: '',
        alias: 'snap-yaml',
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
                required: false
            },
            default_provider: {
                type: String,
                required: false,
                alias: 'default-provider',
            },
        }],
        required: false,
        default: [],
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
        default: [],
    },
    snapshot_date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    snapshotVersion: {
        type: Number,
        required: true,
        default: 1,
    }
});

export const SnapsModel = model("Snaps", SnapsSchema);
