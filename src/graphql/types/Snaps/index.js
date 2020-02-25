export const schema = `
    type Snap {
        _id: ID!
        snap_id: String
        name: String!
        package_name: String
        base_snap: String
        title: String
        summary: String
        description: String
        architecture: [String]
        website: String
        contact: String
        version: String
        icon_url: String
        screenshot_urls: [String]
        ratings_average: Float
        prices: [Price]
        license: String
        developer_id: String
        developer_validation: String
        publisher: String
        developer_name: String
        date_published: Date
        last_updated: Date
        snapshot_date: Date
        categories: [String]
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
    }
`;
