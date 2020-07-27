import * as functions from 'firebase-functions';
import mongoose from 'mongoose';
import {MongooseDataloaderFactory} from 'graphql-dataloader-mongoose';

import {schema} from "./graphql";

const { PORT, NODE_ENV } = process.env;

// Connect to MongoDB with Mongoose.
const mongoUrl = process.env.MONGO_URL || functions.config().mongo.url || 'mongodb://localhost/snapstats';
mongoose
  .connect(
    mongoUrl,
    {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    }
  )
  .catch((err) => console.log(`Mongo failed to connect: ${err.toString()}; ${mongoUrl}`));

const graphQLConfig = {
  schema,
  playground: true,
  introspection: true,
  context: async ctx => {
    let dataloaderFactory = new MongooseDataloaderFactory();
    return { ...ctx, dataloaderFactory };
  },
};

let server, graphql;
export * from './functions';

const dev = process.env.SNAPSTATS_DEV === 'true';
if (process.env.NODE_ENV === 'development') {
  (async function() {
    const {JSDOM} = await import('jsdom');
    global.window = (new JSDOM('')).window;

    const sirv = (await import('sirv')).default;
    const express = (await import('express')).default;
    const compression = (await import('compression')).default;
    const sapper = (await import('@sapper/server'));
    const GraphQL = (await import('apollo-server-express')).ApolloServer;

    const app = express() // You can also use Express
    app.use(compression({ threshold: 0 }))
    app.use(sirv('static', {dev}))
    graphql = new GraphQL(graphQLConfig);
    graphql.applyMiddleware({app});
    app.use(sapper.middleware())

    app.listen(3000, err => {
      if (err) console.log('error', err);
    })
  }());
}
else {
  server = functions.runWith({
    timeoutSeconds: 30,
    memory: '128MB',
  }).https.onRequest(async (req, res) => {
    const {JSDOM} = await import('jsdom');
    global.window = (new JSDOM('')).window;
    const sapper = await import('@sapper/server');
    req.baseUrl = '';
    return sapper.middleware()(req, res);
  });

  graphql = functions.runWith({
    timeoutSeconds: 30,
    memory: '256MB',
  }).https.onRequest(async (req, res) => {
    const GraphQL = (await import('apollo-server-cloud-functions')).ApolloServer;
    const graphql = new GraphQL(graphQLConfig);
    return graphql.createHandler()(req, res);
  });
}

export {server, graphql};
