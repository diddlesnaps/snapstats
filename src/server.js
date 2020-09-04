import * as functions from 'firebase-functions';

import {getGQLConfig} from './graphql-config';

const { PORT, NODE_ENV } = process.env;

let server, graphql;
export * from './functions';

const dev = process.env.SNAPSTATS_DEV === 'true';
if (process.env.NODE_ENV === 'development') {
  (async function() {
    const graphQLConfig = getGQLConfig();

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
    memory: '256MB',
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
    const graphQLConfig = getGQLConfig();

    const GraphQL = (await import('apollo-server-cloud-functions')).ApolloServer;
    const graphql = new GraphQL(graphQLConfig);
    return graphql.createHandler()(req, res);
  });
}

export {server, graphql};
