"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertPlayerLink = upsertPlayerLink;
exports.getPlayer = getPlayer;
exports.applyVip = applyVip;
exports.removeVip = removeVip;
exports.getVipStatus = getVipStatus;
exports.expireVipAndCollectEvents = expireVipAndCollectEvents;
const env_1 = require("../config/env");
const database_1 = require("./database");
function nowIso() {
    return new Date().toISOString();
}
function addDays(days) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString();
}
function upsertPlayerLink(serverIdRaw, discordId, steamId) {
    (0, database_1.assertServer)(serverIdRaw);
    const serverId = serverIdRaw;
    const db = (0, database_1.readDb)(serverId);
    const current = db.players[discordId];
    const player = {
        discordId,
        steamId,
        serverId,
        vip: current?.vip || { active: false },
        createdAt: current?.createdAt || nowIso(),
        updatedAt: nowIso()
    };
    db.players[discordId] = player;
    (0, database_1.writeDb)(serverId, db);
    return player;
}
function getPlayer(serverIdRaw, discordId) {
    (0, database_1.assertServer)(serverIdRaw);
    return (0, database_1.readDb)(serverIdRaw).players[discordId];
}
function applyVip(serverIdRaw, discordId, type) {
    (0, database_1.assertServer)(serverIdRaw);
    const serverId = serverIdRaw;
    const db = (0, database_1.readDb)(serverId);
    const player = db.players[discordId];
    if (!player) {
        throw new Error("Player not linked to Steam yet");
    }
    const expiresAt = addDays(type === "vip" ? env_1.env.vipDurationDays : env_1.env.vipPlusDurationDays);
    player.vip = { active: true, type, expiresAt, lastUpdatedAt: nowIso() };
    player.updatedAt = nowIso();
    db.players[discordId] = player;
    (0, database_1.writeDb)(serverId, db);
    return player;
}
function removeVip(serverIdRaw, discordId) {
    (0, database_1.assertServer)(serverIdRaw);
    const serverId = serverIdRaw;
    const db = (0, database_1.readDb)(serverId);
    const player = db.players[discordId];
    if (!player) {
        throw new Error("Player not found");
    }
    player.vip = { active: false, lastUpdatedAt: nowIso() };
    player.updatedAt = nowIso();
    db.players[discordId] = player;
    (0, database_1.writeDb)(serverId, db);
    return player;
}
function getVipStatus(serverIdRaw, discordId) {
    const player = getPlayer(serverIdRaw, discordId);
    if (!player) {
        return { active: false };
    }
    return player.vip;
}
function expireVipAndCollectEvents() {
    const serverIds = ["server1", "server2"];
    const events = [];
    for (const serverId of serverIds) {
        const db = (0, database_1.readDb)(serverId);
        let dirty = false;
        for (const player of Object.values(db.players)) {
            if (!player.vip.active || !player.vip.expiresAt)
                continue;
            if (new Date(player.vip.expiresAt).getTime() <= Date.now()) {
                events.push({
                    discordId: player.discordId,
                    serverId,
                    vipType: player.vip.type
                });
                player.vip = { active: false, lastUpdatedAt: nowIso() };
                player.updatedAt = nowIso();
                dirty = true;
            }
        }
        if (dirty) {
            (0, database_1.writeDb)(serverId, db);
        }
    }
    return events;
}
