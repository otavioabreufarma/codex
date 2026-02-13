import axios from "axios";
import { env } from "../config/env";

const client = axios.create({
  baseURL: env.backendUrl,
  headers: { "x-api-key": env.botApiKey }
});

export async function requestSteamLink(discordId: string, serverId: "server1" | "server2"): Promise<string> {
  const response = await client.post("/auth/steam/link", { discordId, serverId });
  return response.data.authUrl;
}

export async function getSteamLinkStatus(discordId: string, serverId: "server1" | "server2"): Promise<boolean> {
  const response = await client.get("/auth/steam/status", { params: { discordId, serverId } });
  return Boolean(response.data.linked);
}

export async function requestCheckout(
  discordId: string,
  serverId: "server1" | "server2",
  type: "vip" | "vip+"
): Promise<{ orderNsu: string; checkoutUrl: string }> {
  const response = await client.post("/payments/checkout", { discordId, serverId, type });
  return response.data;
}

export interface PendingEvent {
  eventId: string;
  type: "PAYMENT_CONFIRMED" | "VIP_EXPIRED";
  discordId: string;
  serverId: "server1" | "server2";
  vipType?: "vip" | "vip+";
}

export async function fetchBotEvents(): Promise<PendingEvent[]> {
  const response = await client.get("/bot/events");
  return response.data.events;
}

export async function ackBotEvent(eventId: string): Promise<void> {
  await client.post(`/bot/events/${eventId}/ack`);
}
