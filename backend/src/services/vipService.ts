import { env } from "../config/env";
import { PlayerRecord, ServerId, VipType } from "../types/models";
import { assertServer, readDb, writeDb } from "./database";

function nowIso(): string {
  return new Date().toISOString();
}

function addDays(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

export function upsertPlayerLink(serverIdRaw: string, discordId: string, steamId: string): PlayerRecord {
  assertServer(serverIdRaw);
  const serverId = serverIdRaw as ServerId;
  const db = readDb(serverId);
  const current = db.players[discordId];

  const player: PlayerRecord = {
    discordId,
    steamId,
    serverId,
    vip: current?.vip || { active: false },
    createdAt: current?.createdAt || nowIso(),
    updatedAt: nowIso()
  };

  db.players[discordId] = player;
  writeDb(serverId, db);
  return player;
}

export function getPlayer(serverIdRaw: string, discordId: string): PlayerRecord | undefined {
  assertServer(serverIdRaw);
  return readDb(serverIdRaw).players[discordId];
}

export function applyVip(serverIdRaw: string, discordId: string, type: VipType): PlayerRecord {
  assertServer(serverIdRaw);
  const serverId = serverIdRaw as ServerId;
  const db = readDb(serverId);
  const player = db.players[discordId];
  if (!player) {
    throw new Error("Player not linked to Steam yet");
  }

  const expiresAt = addDays(type === "vip" ? env.vipDurationDays : env.vipPlusDurationDays);
  player.vip = { active: true, type, expiresAt, lastUpdatedAt: nowIso() };
  player.updatedAt = nowIso();
  db.players[discordId] = player;
  writeDb(serverId, db);
  return player;
}

export function removeVip(serverIdRaw: string, discordId: string): PlayerRecord {
  assertServer(serverIdRaw);
  const serverId = serverIdRaw as ServerId;
  const db = readDb(serverId);
  const player = db.players[discordId];
  if (!player) {
    throw new Error("Player not found");
  }

  player.vip = { active: false, lastUpdatedAt: nowIso() };
  player.updatedAt = nowIso();
  db.players[discordId] = player;
  writeDb(serverId, db);
  return player;
}

export function getVipStatus(serverIdRaw: string, discordId: string): PlayerRecord["vip"] {
  const player = getPlayer(serverIdRaw, discordId);
  if (!player) {
    return { active: false };
  }
  return player.vip;
}

export function expireVipAndCollectEvents(): Array<{ discordId: string; serverId: ServerId; vipType?: VipType }> {
  const serverIds: ServerId[] = ["server1", "server2"];
  const events: Array<{ discordId: string; serverId: ServerId; vipType?: VipType }> = [];

  for (const serverId of serverIds) {
    const db = readDb(serverId);
    let dirty = false;

    for (const player of Object.values(db.players)) {
      if (!player.vip.active || !player.vip.expiresAt) continue;

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
      writeDb(serverId, db);
    }
  }

  return events;
}
