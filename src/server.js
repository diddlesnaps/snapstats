import * as functions from 'firebase-functions';
import mongoose from 'mongoose';
// import expressGraphQL from 'express-graphql';
import {ApolloServer as prodGraphQL} from 'apollo-server-cloud-functions';
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

let server, graphql;
export * from './functions';

const dev = process.env.SNAPSTATS_DEV === 'true';
if (dev && process.env.NODE_ENV === 'development') {
  (function() {
    const {JSDOM} = require('jsdom');
    global.window = (new JSDOM('')).window;

		const sirv = require('sirv');
		const express = require('express');
		const compression = require('compression');
    const sapper = require('@sapper/server');
    const GraphQL = require('apollo-server-express').ApolloServer;

		const app = express() // You can also use Express
		app.use(compression({ threshold: 0 }))
		app.use(sirv('static', {dev}))
    app.use(sapper.middleware())
    graphql = new GraphQL(graphQLConfig);
    graphql.applyMiddleware({app});

		app.listen(3000, err => {
			if (err) console.log('error', err);
		})
  }());
}
else {
  server = functions.runWith({
		timeoutSeconds: 5,
		memory: '128MB',
	}).https.onRequest((req, res) => {
    const {JSDOM} = require('jsdom');
    global.window = (new JSDOM('')).window;
    const sapper = require('@sapper/server');
    req.baseUrl = '';
		return sapper.middleware()(req, res);
  });

  graphql = functions.runWith({
    timeoutSeconds: 30,
    memory: '256MB',
  }).https.onRequest(new prodGraphQL(graphQLConfig).createHandler());
}

export {server, graphql};
