import * as functions from "firebase-functions";
import mongoose from "mongoose";

export async function connectMongoose() {
  // Connect to MongoDB with Mongoose.
  const mongoUrl = process.env.MONGO_URL || functions.config().mongo.url || "mongodb://localhost/snapstats";
  try {
    return mongoose
        .connect(
            mongoUrl,
            {
              connectTimeoutMS: 5000,
              serverSelectionTimeoutMS: 5000,
            }
        );
  } catch (err) {
    console.log(`Mongo failed to connect: ${err.toString()}; ${mongoUrl}`);
    process.exit(1);
  }
}
