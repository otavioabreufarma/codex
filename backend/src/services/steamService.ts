import crypto from "crypto";
import { env } from "../config/env";

const steamOpenIdUrl = "https://steamcommunity.com/openid/login";

interface SteamState {
  discordId: string;
  serverId: string;
  issuedAt: number;
}

function base64Url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

function fromBase64Url(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(data: string): string {
  return crypto.createHmac("sha256", env.sessionSigningSecret).update(data).digest("hex");
}

export function createSteamAuthUrl(discordId: string, serverId: string): string {
  const state: SteamState = { discordId, serverId, issuedAt: Date.now() };
  const payload = base64Url(JSON.stringify(state));
  const signature = sign(payload);

  const callbackUrl = new URL(`${env.baseUrl}/auth/steam/callback`);
  callbackUrl.searchParams.set("state", `${payload}.${signature}`);

  const returnTo = callbackUrl.toString();
  const realm = env.baseUrl;

  const url = new URL(steamOpenIdUrl);
  url.searchParams.set("openid.ns", "http://specs.openid.net/auth/2.0");
  url.searchParams.set("openid.mode", "checkid_setup");
  url.searchParams.set("openid.return_to", returnTo);
  url.searchParams.set("openid.realm", realm);
  url.searchParams.set("openid.identity", "http://specs.openid.net/auth/2.0/identifier_select");
  url.searchParams.set("openid.claimed_id", "http://specs.openid.net/auth/2.0/identifier_select");

  return url.toString();
}

export function validateState(rawState: string): { discordId: string; serverId: string } {
  const [payload, signature] = rawState.split(".");
  if (!payload || !signature || sign(payload) !== signature) {
    throw new Error("Invalid state signature");
  }

  const state = JSON.parse(fromBase64Url(payload)) as SteamState;
  if (Date.now() - state.issuedAt > 15 * 60_000) {
    throw new Error("Expired state");
  }

  return { discordId: state.discordId, serverId: state.serverId };
}

export function extractSteamId(claimedId: string): string {
  const match = claimedId.match(/\/id\/(\d+)$|\/openid\/id\/(\d+)$/);
  const steamId = match?.[1] ?? match?.[2];
  if (!steamId) {
    throw new Error("SteamID64 not found in claimed_id");
  }
  return steamId;
}
