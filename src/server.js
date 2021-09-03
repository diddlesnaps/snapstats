import * as functions from 'firebase-functions';

let server, graphql;
export * from './functions';

const dev = process.env.SNAPSTATS_DEV === 'true';
if (process.env.NODE_ENV === 'development') {
  (function() {
    const graphQLConfig = require('./graphql-config').getGQLConfig();

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
    graphql = new GraphQL(graphQLConfig);
    graphql.applyMiddleware({app});
    app.use(sapper.middleware())
    app.listen(3000, err => {
      if (err) console.log('error', err);
    })
  })
}
else {
  server = functions.runWith({
    timeoutSeconds: 30,
    memory: '256MB',
  }).https.onRequest(async (req, res) => {
    const {JSDOM} = require('jsdom');
    global.window = (new JSDOM('')).window;
    const sapper = await import('@sapper/server');
    req.baseUrl = '';
    return sapper.middleware()(req, res);
  });

  graphql = functions.runWith({
    timeoutSeconds: 30,
    memory: '256MB',
  }).https.onRequest(async (req, res) => {
    const graphQLConfig = (await import('./graphql-config')).getGQLConfig();

    const GraphQL = (await import('apollo-server-cloud-functions')).ApolloServer;
    const graphql = new GraphQL(graphQLConfig);
    return graphql.createHandler({
      cors: {
        origin: [
          'https://snapstats.org',
          'http://localhost:5000',
        ],
      }
    })(req, res);
  });
}

export {server, graphql};
