import * as functions from 'firebase-functions';
import mongoose from 'mongoose';
import express from 'express';
import expressGraphQL from 'express-graphql';
import compression from 'compression';
import { JSDOM } from 'jsdom';
import * as sapper from '@sapper/server';
import sirv from 'sirv';

import {schema} from "./graphql";
import {collectStats} from './collectors/collectStats';
import {collectRatings} from './collectors/collectRatings';
import {thinSnaps} from './collectors/thinStats';
import {snapsSnapshotSubscriber} from './pubsub/snapsSnapshot';
import {newSnapsSubscriber} from './pubsub/newSnaps';

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

const getGraphQL = async (...args) => expressGraphQL({
    schema,
    graphiql: true,
  })(...args);

const getApp = async (...args) => {
  // try {
  global.window = (new JSDOM('')).window;

  const app = express(); // You can also use Express

  app.use((req, res, next) => {
    res.set('Cache-Control', 'public, max-age=600, s-maxage=900');
    return next();
  });
  app.use(compression({ threshold: 0 }));

  if (dev) {
    app.use(sirv('static', { dev }));
    app.use('/graphql', getGraphQL);
  }

  app.use(sapper.middleware());

  if (dev) {
    app.listen(3000, err => {
      if (err) console.log('error', err);
    });
    return app;
  } else {
    return app(...args);
  }
};

const getCollectStats = (isDaily) => async (...args) => collectStats(isDaily)(...args);
const getCollectRatings = async (...args) => collectRatings(...args);
const getThinStats = async (...args) => thinSnaps(...args);
const getSnapsSnapshotSubscriber = async (...args) => snapsSnapshotSubscriber(...args);
const getNewSnapsSubscriber = async (...args) => newSnapsSubscriber(...args);

if (dev) {
  getApp();
}

export {
  getApp,
  getGraphQL,
  getCollectStats,
  getCollectRatings,
  getThinStats,
  getSnapsSnapshotSubscriber,
  getNewSnapsSubscriber,
};
