// @ts-check

export const schema = `
    type Channel {
        _id: ID!
        name: String!
        count: Int!
        date: Date!
    }

    type ChannelsByDate {
        _id: Date!
        channels: [Channel]
    }

    type ChannelCount {
        date: String!
        count: Int!
    }

    type ChannelTimeline {
        _id: String!
        counts: [ChannelCount]
    }

    type Query {
        channel(_id: ID!): Channel
        channelCount: PaginationCount
        channels(query: Pagination!): [Channel]
        channelsByDate(query: Pagination!): [ChannelsByDate]
        channelTimeline(from: Date): [ChannelTimeline]
    }

    type Mutation {
        addChannel(name: String!, count: Int!): Channel
    }
`;
