import { app } from "./app";
import { connectDb } from "./config/db";
import { env } from "./config/env";

const start = async (): Promise<void> => {
  await connectDb();
  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
