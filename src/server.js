import * as functions from 'firebase-functions';
import mongoose from 'mongoose';
import express from 'express';
// import expressGraphQL from 'express-graphql';
import {ApolloServer as devGraphQL} from 'apollo-server-express';
import {ApolloServer as prodGraphQL} from 'apollo-server-cloud-functions';
import {MongooseDataloaderFactory} from 'graphql-dataloader-mongoose';
import compression from 'compression';
import {JSDOM} from 'jsdom';
import * as sapper from '@sapper/server';
import sirv from 'sirv';

import {schema} from "./graphql";
import {collectStats} from './collectors/collectStats';
import {collectRatings} from './collectors/collectRatings';
import {thinSnaps} from './collectors/thinStats';
import {snapsSnapshotSubscriber} from './pubsub/snapsSnapshot';
import {newSnapsSubscriber} from './pubsub/newSnaps';
import {sitemap} from './sitemap';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

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
  .catch((err) => console.log(`Mongo failed to connect: ${err.toString()}`));

const graphQLConfig = {
  schema,
  playground: true,
  introspection: true,
  context: async ctx => {
    let dataloaderFactory = new MongooseDataloaderFactory();
    return { ...ctx, dataloaderFactory };
  },
};

const graphQL = new prodGraphQL(graphQLConfig).createHandler();

const getApp = (...args) => {
  // try {
  global.window = (new JSDOM('')).window;

  const app = express(); // You can also use Express

  app.use((req, res, next) => {
    res.set('Cache-Control', 'public, max-age=600, s-maxage=900');
    return next();
  });
  app.use(compression({ threshold: 0 }));

  let graphql;
  if (dev) {
    app.use(sirv('static', { dev }));
    graphql = new devGraphQL(graphQLConfig);
    graphql.applyMiddleware({app});
  }

  app.use(sapper.middleware());

  if (dev) {
    app.listen(3000, err => {
      if (err) console.log('error', err);
    });
    return graphql;
  } else {
    return app(...args);
  }
};

if (dev) {
  getApp();
}

export {
  getApp,
  sitemap,
  graphQL,
  collectStats,
  collectRatings,
  thinSnaps,
  snapsSnapshotSubscriber,
  newSnapsSubscriber,
};
