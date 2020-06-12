export const schema = `
    type SnapMedia {
        type: String
        width: Int
        height: Int
        url: String
    }

    type Snap {
        _id: ID!
        architecture: [String]
        base_snap: String
        common_ids: [String]
        contact: String
        date_published: Date
        description: String
        developer_id: String
        developer_name: String
        developer_username: String
        developer_validation: String
        icon_url: String
        last_updated: Date
        license: String
        media: [SnapMedia]
        name: String!
        package_name: String
        prices: [Price]
        publisher: String
        ratings_average: Float
        ratings_count: Int
        screenshot_urls: [String]
        sections: [String]
        snap_id: String
        snapshot_date: Date
        summary: String
        title: String
        version: String
        website: String
    }

    type Query {
        findSnaps(name: String, publisherOrDeveloper: String, base: String, architecture: String, categories: String, license: String, developerValidated: Boolean, query: Pagination!): [Snap]
        findSnapsCount(name: String, publisherOrDeveloper: String, base: String, architecture: String, categories: String, license: String, developerValidated: Boolean): PaginationCount
        findSnapsByName(name: String!, query: Pagination!): [Snap]
        findSnapsByNameCount(name: String!): PaginationCount
        findSnapsByBase(base: String!, query: Pagination!): [Snap]
        findSnapsByBaseCount(base: String!): PaginationCount
        snapByName(name: String!, query: Pagination): Snap
        snapById(snap_id: String!, query: Pagination): Snap
        snapsByDate(query: Pagination!): [Snap]
        snapsByDateCount: PaginationCount
        snapsByUpdatedDate(query: Pagination!): [Snap]
        snapsByUpdatedDateCount(query: Pagination!): [Snap]
    }
`;
