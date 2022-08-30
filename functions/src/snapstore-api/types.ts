/* eslint-disable camelcase */
export interface SnapApiResults {
    snap: SnapApiSnap[]
}

export interface SnapApiSnapResult {
    snap: SnapApiSnap
    details_api_url: string
}

export interface SnapApiPublisher {
    "display-name": string
    username: string
    validation: string
}

export interface SnapApiSnap {
    package_name: string
    revision: number
    architecture: string[]
    base: string
    channel: string
    sections: string[] | {
        name: string
    }[]
    publisher: string | null | SnapApiPublisher
    snapshotVersion: number | null
    publisher_username: string | null
    developer_validation: string | null
    last_updated: string
    date_published: string
    title: string
    base_snap: string
}

export interface TStats {
    snaps: SnapApiSnapResult[]
    sections: {
        name: string
        count: number
    }[]
    architectures: {
        name: string
        count: number
    }[]
    bases: {
        name: string
        count: number
    }[]
    channels: {
        name: string
        count: number
    }[]
    confinements: {
        name: string;
        count: number;
    }[]
    developer_counts: {
        mean: number;
        mode: number;
        median: number;
        total: number;
    }
    snap_counts: {
        total: number;
        filtered: number;
    }
}

export interface SnapApiData {
    _embedded: {
        "clickindex:package": SnapApiSnap[]
    },
    _links: {
        next: {
            href: string
        }
    },
    total: number,
}

export interface SnapApiSectionsData {
    _embedded: {
        "clickindex:sections": {
            name: string
        }[]
    }
}
