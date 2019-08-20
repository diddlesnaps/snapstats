import { makeExecutableSchema } from "graphql-tools";

import typeDefs from "./types";
import resolvers from "./resolvers";

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});
