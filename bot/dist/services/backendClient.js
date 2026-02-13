"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestSteamLink = requestSteamLink;
exports.getSteamLinkStatus = getSteamLinkStatus;
exports.requestCheckout = requestCheckout;
exports.fetchBotEvents = fetchBotEvents;
exports.ackBotEvent = ackBotEvent;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const client = axios_1.default.create({
    baseURL: env_1.env.backendUrl,
    headers: { "x-api-key": env_1.env.botApiKey }
});
async function requestSteamLink(discordId, serverId) {
    const response = await client.post("/auth/steam/link", { discordId, serverId });
    return response.data.authUrl;
}
async function getSteamLinkStatus(discordId, serverId) {
    const response = await client.get("/auth/steam/status", { params: { discordId, serverId } });
    return Boolean(response.data.linked);
}
async function requestCheckout(discordId, serverId, type) {
    const response = await client.post("/payments/checkout", { discordId, serverId, type });
    return response.data;
}
async function fetchBotEvents() {
    const response = await client.get("/bot/events");
    return response.data.events;
}
async function ackBotEvent(eventId) {
    await client.post(`/bot/events/${eventId}/ack`);
}
