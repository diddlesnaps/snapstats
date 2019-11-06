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
app.use(compression({ threshold: 0 }))

if (PORT && dev) {
  app.use(sirv('static', { dev }))
  app.use('/graphql', expressGraphQLServer);
	app.listen(PORT, err => {
		if (err) console.log('error', err);
  });
}

app.use(sapper.middleware());

export {app, expressGraphQLServer, collectStats, collectRatings, thinStats};
