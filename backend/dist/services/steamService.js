"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSteamAuthUrl = createSteamAuthUrl;
exports.validateState = validateState;
exports.extractSteamId = extractSteamId;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const steamOpenIdUrl = "https://steamcommunity.com/openid/login";
function base64Url(input) {
    return Buffer.from(input).toString("base64url");
}
function fromBase64Url(input) {
    return Buffer.from(input, "base64url").toString("utf8");
}
function sign(data) {
    return crypto_1.default.createHmac("sha256", env_1.env.sessionSigningSecret).update(data).digest("hex");
}
function createSteamAuthUrl(discordId, serverId) {
    const state = { discordId, serverId, issuedAt: Date.now() };
    const payload = base64Url(JSON.stringify(state));
    const signature = sign(payload);
    const callbackUrl = new URL(`${env_1.env.baseUrl}/auth/steam/callback`);
    callbackUrl.searchParams.set("state", `${payload}.${signature}`);
    const returnTo = callbackUrl.toString();
    const realm = env_1.env.baseUrl;
    const url = new URL(steamOpenIdUrl);
    url.searchParams.set("openid.ns", "http://specs.openid.net/auth/2.0");
    url.searchParams.set("openid.mode", "checkid_setup");
    url.searchParams.set("openid.return_to", returnTo);
    url.searchParams.set("openid.realm", realm);
    url.searchParams.set("openid.identity", "http://specs.openid.net/auth/2.0/identifier_select");
    url.searchParams.set("openid.claimed_id", "http://specs.openid.net/auth/2.0/identifier_select");
    return url.toString();
}
function validateState(rawState) {
    const [payload, signature] = rawState.split(".");
    if (!payload || !signature || sign(payload) !== signature) {
        throw new Error("Invalid state signature");
    }
    const state = JSON.parse(fromBase64Url(payload));
    if (Date.now() - state.issuedAt > 15 * 60000) {
        throw new Error("Expired state");
    }
    return { discordId: state.discordId, serverId: state.serverId };
}
function extractSteamId(claimedId) {
    const match = claimedId.match(/\/id\/(\d+)$|\/openid\/id\/(\d+)$/);
    const steamId = match?.[1] ?? match?.[2];
    if (!steamId) {
        throw new Error("SteamID64 not found in claimed_id");
    }
    return steamId;
}
