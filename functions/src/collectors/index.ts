import * as functions from "firebase-functions";

export const hourlyStats = functions.runWith({
  timeoutSeconds: 540,
  memory: "512MB",
}).pubsub.schedule("every 6 hours").onRun(async (context) => (await import("./collectStats")).hourly());
export const dailyStats = functions.runWith({
  timeoutSeconds: 540,
  memory: "512MB",
}).pubsub.schedule("every 24 hours").onRun(async (context) => (await import("./collectStats")).daily());
export const dailyLicenses = functions.runWith({
  timeoutSeconds: 30,
  memory: "256MB",
}).pubsub.schedule("every 24 hours").onRun(async (context) => (await import("./extractLicenses")).daily());
// export const dailyStats = functions.pubsub.schedule('every 24 hours').onRun(collectStats(true));
export const dailyRatings = functions.runWith({
  timeoutSeconds: 30,
  memory: "256MB",
}).pubsub.schedule("every 24 hours").onRun(async (context) => (await import("./collectRatings")).default());
export const dailyThinStats = functions.runWith({
  timeoutSeconds: 300,
  memory: "128MB",
}).pubsub.schedule("every 24 hours").onRun(async (context) => (await import("./thinStats")).default());
