import { app } from "./app";
import { connectDb } from "./config/db";
import { env } from "./config/env";
import { connectRedis, disconnectRedis } from "./config/redis";
import { startHoldExpiryJob, stopHoldExpiryJob } from "./jobs/hold-expiry.job";

const shutdown = async (signal: string): Promise<void> => {
  console.log(`Received ${signal}, shutting down...`);
  stopHoldExpiryJob();
  await disconnectRedis();
  process.exit(0);
};

const start = async (): Promise<void> => {
  await connectDb();
  await connectRedis();
  startHoldExpiryJob();

  const server = app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });

  process.on("SIGINT", () => {
    server.close(() => {
      void shutdown("SIGINT");
    });
  });
  process.on("SIGTERM", () => {
    server.close(() => {
      void shutdown("SIGTERM");
    });
  });
};

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
