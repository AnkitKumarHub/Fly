import type { Response } from "express";

import type { RealtimeEvent } from "./types.js";

const clientsByTenant = new Map<string, Set<Response>>();

export function subscribeSse(tenantId: string, res: Response) {
  let clients = clientsByTenant.get(tenantId);
  if (!clients) {
    clients = new Set();
    clientsByTenant.set(tenantId, clients);
  }
  clients.add(res);
}

export function unsubscribeSse(tenantId: string, res: Response) {
  const clients = clientsByTenant.get(tenantId);
  if (!clients) return;

  clients.delete(res);
  if (clients.size === 0) {
    clientsByTenant.delete(tenantId);
  }
}

export function fanOutToSseClients(event: RealtimeEvent) {
  const clients = clientsByTenant.get(event.tenantId);
  if (!clients) return;

  const payload = `data: ${JSON.stringify(event)}\n\n`;

  for (const res of clients) {
    res.write(payload);
  }
}
