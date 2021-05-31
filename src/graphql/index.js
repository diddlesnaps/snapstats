// @ts-check

import { makeExecutableSchema } from "@graphql-tools/merge";

import typeDefs from "./types";
import resolvers from "./resolvers";

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});
