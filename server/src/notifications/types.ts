export type RealtimeResourceType = "email" | "calendar";

export type RealtimeAction = "created" | "updated" | "deleted";

export interface RealtimeEvent {
  tenantId: string;
  type: RealtimeResourceType;
  action: RealtimeAction;
  id: string;
}

export const REALTIME_CHANNEL = "fly_realtime";
