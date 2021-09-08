// @ts-check

export const schema = `
    type License {
        _id: ID!
        name: String!
        count: Int!
        date: Date!
    }

    type LicensesByDate {
        _id: Date!
        licenses: [License]
    }

    type LicenseCount {
        date: String!
        count: Int!
    }

    type LicenseTimeline {
        _id: String!
        counts: [LicenseCount]
    }

    type Query {
        license(_id: ID!): License
        licenseCount: PaginationCount
        licenses(query: Pagination!): [License]
        licensesByDate(query: Pagination!): [LicensesByDate]
        licenseTimeline(from: Date): [LicenseTimeline]
    }

    type Mutation {
        addLicense(name: String!, count: Int!): License
    }
`;
