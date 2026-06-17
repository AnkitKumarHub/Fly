import "dotenv/config";
import { createServer } from "node:http";

import { createApplication } from "./server.js";

async function main() {
  try {
    const server = createServer(createApplication());
    const PORT = Number(process.env.PORT) || 8000;

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} - http://localhost:${PORT}`);
    });
  } catch {
    console.error("Error starting the server");
    process.exit(1);
  }
}

void main();
