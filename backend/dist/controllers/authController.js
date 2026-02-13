"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSteamAuthLink = getSteamAuthLink;
exports.steamCallback = steamCallback;
exports.getSteamLinkStatus = getSteamLinkStatus;
const database_1 = require("../services/database");
const steamService_1 = require("../services/steamService");
const vipService_1 = require("../services/vipService");
function getSteamAuthLink(req, res) {
    const { discordId, serverId } = req.body;
    if (!discordId || !serverId) {
        res.status(400).json({ error: "discordId and serverId are required" });
        return;
    }
    try {
        (0, database_1.assertServer)(serverId);
        const authUrl = (0, steamService_1.createSteamAuthUrl)(discordId, serverId);
        res.json({ authUrl });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
function upsertOrGet(serverId, discordId) {
    return (0, vipService_1.getPlayer)(serverId, discordId);
}
function steamCallback(req, res) {
    try {
        const state = req.query.state;
        const claimedId = req.query["openid.claimed_id"];
        if (!state || !claimedId) {
            res.status(400).send("Invalid callback payload");
            return;
        }
        const { discordId, serverId } = (0, steamService_1.validateState)(state);
        const steamId = (0, steamService_1.extractSteamId)(claimedId);
        (0, vipService_1.upsertPlayerLink)(serverId, discordId, steamId);
        res.send("Steam vinculado com sucesso. Você já pode voltar para o Discord.");
    }
    catch (error) {
        res.status(400).send(`Falha ao vincular Steam: ${error.message}`);
    }
}
function getSteamLinkStatus(req, res) {
    const { discordId, serverId } = req.query;
    if (!discordId || !serverId) {
        res.status(400).json({ error: "discordId and serverId are required" });
        return;
    }
    try {
        (0, database_1.assertServer)(serverId);
        const player = upsertOrGet(serverId, discordId);
        res.json({ linked: Boolean(player?.steamId), steamId: player?.steamId || null });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
