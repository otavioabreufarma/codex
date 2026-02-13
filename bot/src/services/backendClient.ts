import axios from "axios";
import { env } from "../config/env";

const client = axios.create({
  baseURL: env.backendUrl,
  headers: { "x-bot-token": env.botWebhookToken }
});

export async function requestSteamLink(discordId: string, serverId: "server1" | "server2"): Promise<string> {
  const response = await client.post("/auth/steam/link", { discordId, serverId });
  return response.data.authUrl;
}

export async function requestCheckout(
  discordId: string,
  serverId: "server1" | "server2",
  type: "vip" | "vip+"
): Promise<{ orderNsu: string; checkoutUrl: string }> {
  const response = await client.post("/payments/checkout", { discordId, serverId, type });
  return response.data;
}
