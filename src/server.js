import * as functions from 'firebase-functions';

import sirv from 'sirv';
import compression from 'compression';
import * as sapper from '@sapper/server';
import mongoose from 'mongoose';
import express from 'express';
import expressGraphQL from "express-graphql";

import { schema } from "./graphql";
import { collectStats, collectRatings, thinStats } from './collector.js';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

const mongoUrl = process.env.MONGO_URL || functions.config().mongo.url || 'mongodb://localhost/snapstats';
// Connect to MongoDB with Mongoose.
mongoose
  .connect(
    mongoUrl,
    {
      useCreateIndex: true,
      useNewUrlParser: true,
      reconnectTries: Number.MAX_VALUE,
      reconnectInterval: 500,
      connectTimeoutMS: 10000,
    }
  )
  .catch((err) => console.log(`Mongo failed to connect: ${err.toString()}`));

const expressGraphQLServer = expressGraphQL({
  schema,
  graphiql: true,
});

const app = express() // You can also use Express
  .use(compression({ threshold: 0 }))
  .use(sirv('static', { dev }))
if (PORT) {
  app.use('/graphql', expressGraphQLServer);
	app.listen(PORT, err => {
		if (err) console.log('error', err);
  });
}

app.use(sapper.middleware());

export const server = functions.runWith({
  timeoutSeconds: 45,
  memory: '256MB',
}).https.onRequest(app);

export const graphql = functions.runWith({
  timeoutSeconds: 30,
  memory: '256MB',
}).https.onRequest(expressGraphQLServer);

export const hourlyStats = functions.runWith({
  timeoutSeconds: 300,
  memory: '512MB'
}).pubsub.schedule('every 4 hours').onRun(collectStats(false));
// export const dailyStats = functions.pubsub.schedule('every 24 hours').onRun(collectStats(true));
export const dailyRatings = functions.runWith({
  timeoutSeconds: 30,
  memory: '128MB',
}).pubsub.schedule('every 24 hours').onRun(collectRatings);
export const dailyThinning = functions.runWith({
  timeoutSeconds: 300,
  memory: '512MB',
}).pubsub.schedule('48 23 * * *').onRun(thinStats);
