import mongoose from 'mongoose';

export function connectMongoose() {
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
}
