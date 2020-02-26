import * as functions from 'firebase-functions';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

const connectDB = async () => {
  // Connect to MongoDB with Mongoose.
  const mongoose = (await import('mongoose')).default;
  const mongoUrl = process.env.MONGO_URL || functions.config().mongo.url || 'mongodb://localhost/snapstats';
  mongoose
    .connect(
      mongoUrl,
      {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        connectTimeoutMS: 10000,
      }
    )
    .catch((err) => console.log(`Mongo failed to connect: ${err.toString()}`));

  return mongoose;
}

const getGraphQL = async (...args) => {
  const expressGraphQL = (await import('express-graphql')).default;
  const {schema} = await import("./graphql");

  const mongoose = await connectDB();
  await expressGraphQL({
    schema,
    graphiql: true,
  })(...args);
  mongoose.disconnect();
}

const getApp = async (...args) => {
  // try {
  const {default: express} = await import('express');
  const {default: sirv} = await import('sirv');
  const {default: compression} = await import('compression');
  const sapper = await import('@sapper/server');

  const { JSDOM } = await import('jsdom');
  global.window = (new JSDOM('')).window;

  const app = express() // You can also use Express

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
}

const getCollectStats = (isDaily) => async (...args) => {
  const mongoose = await connectDB();
  const {collectStats} = (await import('./collectors/collectStats'));
  await collectStats(isDaily)(...args);
  mongoose.disconnect();
}

const getCollectRatings = async (...args) => {
  const mongoose = await connectDB();
  const {collectRatings} = (await import('./collectors/collectRatings'));
  await collectRatings(...args);
  mongoose.disconnect();
}

const getThinStats = async (...args) => {
  const mongoose = await connectDB();
  const {thinSnaps} = (await import('./collectors/thinStats'));
  await thinSnaps(...args);
  mongoose.disconnect();
}

const getNewSnapsSubscriber = async (...args) => {
  const mongoose = await connectDB();
  const {newSnapsSubscriber} = (await import('./pubsub/newSnaps'));
  await newSnapsSubscriber(...args);
  mongoose.disconnect();
}

if (dev) {
  getApp();
}

export {
  getApp,
  getGraphQL,
  getCollectStats,
  getCollectRatings,
  getThinStats,
  getNewSnapsSubscriber,
};
