import "dotenv/config";
import { createCorsair } from "corsair";
import { gmail } from "@corsair-dev/gmail";
import { googlecalendar } from "@corsair-dev/googlecalendar";
import { pool } from "./db/index.js";

export const corsair = createCorsair({
  plugins: [gmail({
    webhookHooks: {
      messageChanged: {
        before(ctx, args) {
          return { ctx, args };
      },
        after: async (_ctx, response) => {
          console.log("Gmail event:", response);
          // console.log("From/subject/snippet:", response);
        },
      },
    },
  }), googlecalendar({
    webhookHooks: {
      onEventChanged: {
        before(ctx, args) {
          return { ctx, args };
        },
        after: async (_ctx, response) => {
          console.log("Calendar event:", response);
        },
      },
    },
  })],
  database: pool,
  kek: process.env.CORSAIR_KEK!,
  multiTenancy: true,
});
