import { createServer } from "node:http";

import { env } from "./config/env.js";
import { bootstrapCorsairIntegrations } from "./bootstrap-corsair.js";
import { startPgListener } from "./notifications/pg-bus.js";
import { createApplication } from "./server.js";

async function main() {
  try {
    await bootstrapCorsairIntegrations();
    await startPgListener();

    const server = createServer(createApplication());
    server.listen(env.port, () => {
      console.log(`Server is running on port ${env.port}`);
    });
  } catch {
    console.error("Error starting the server");
    process.exit(1);
  }
}

void main();
