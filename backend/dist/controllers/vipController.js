"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyVipHandler = applyVipHandler;
exports.removeVipHandler = removeVipHandler;
exports.getVipStatusHandler = getVipStatusHandler;
const vipService_1 = require("../services/vipService");
function applyVipHandler(req, res) {
    try {
        const { serverId, discordId, type } = req.body;
        if (!serverId || !discordId || (type !== "vip" && type !== "vip+")) {
            res.status(400).json({ error: "serverId, discordId e type(vip|vip+) são obrigatórios" });
            return;
        }
        const player = (0, vipService_1.applyVip)(serverId, discordId, type);
        res.json({ ok: true, player });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
function removeVipHandler(req, res) {
    try {
        const { serverId, discordId } = req.body;
        if (!serverId || !discordId) {
            res.status(400).json({ error: "serverId e discordId são obrigatórios" });
            return;
        }
        const player = (0, vipService_1.removeVip)(serverId, discordId);
        res.json({ ok: true, player });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
function getVipStatusHandler(req, res) {
    try {
        const { serverId, discordId } = req.params;
        const status = (0, vipService_1.getVipStatus)(serverId, discordId);
        const player = (0, vipService_1.getPlayer)(serverId, discordId);
        res.json({
            discordId,
            steamId: player?.steamId,
            serverId,
            vip: status
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
