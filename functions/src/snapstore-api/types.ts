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
    date_published: Date
    title: string
    base_snap: string
}

export interface SnapApiData {
    _embedded: {
        "clickindex:package": SnapApiSnap[]
    },
    _links: {
        next: {
            href: string
        }
    }
}

export interface SnapApiSectionsData {
    _embedded: {
        "clickindex:sections": {
            name: string
        }[]
    }
}
