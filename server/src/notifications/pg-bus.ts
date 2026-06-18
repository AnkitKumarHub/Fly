import type { PoolClient } from "pg";

import { pool } from "../db/index.js";
import { fanOutToSseClients } from "./sse.js";
import { REALTIME_CHANNEL, type RealtimeEvent } from "./types.js";

let listenerClient: PoolClient | null = null;

export async function publishRealtimeEvent(event: RealtimeEvent) {
  await pool.query("SELECT pg_notify($1, $2)", [REALTIME_CHANNEL, JSON.stringify(event)]);
}

export async function startPgListener() {
  if (listenerClient) return;

  try {
    const client = await pool.connect();
    listenerClient = client;

    await client.query(`LISTEN ${REALTIME_CHANNEL}`);

    client.on("notification", (message) => {
      if (message.channel !== REALTIME_CHANNEL || !message.payload) return;

      try {
        const event = JSON.parse(message.payload) as RealtimeEvent;
        fanOutToSseClients(event);
      } catch (error) {
        console.error("[PG Listener] Failed to parse notification payload:", error);
      }
    });

    client.on("error", (error) => {
      console.error("[PG Listener] Connection error, reconnecting...", error);
      listenerClient = null;
      client.release();
      setTimeout(() => {
        void startPgListener();
      }, 5000);
    });
  } catch (error) {
    console.error("[PG Listener] Failed to start:", error);
    listenerClient = null;
    setTimeout(() => {
      void startPgListener();
    }, 5000);
  }
}
