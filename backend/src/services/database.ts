import fs from "fs";
import path from "path";
import { ServerDb, ServerId } from "../types/models";

const dataDir = path.join(process.cwd(), "data");
const validServers: ServerId[] = ["server1", "server2"];

function getFile(serverId: ServerId): string {
  return path.join(dataDir, `${serverId}.json`);
}

function ensureFile(serverId: ServerId): void {
  fs.mkdirSync(dataDir, { recursive: true });
  const file = getFile(serverId);

  if (!fs.existsSync(file)) {
    const initial: ServerDb = { serverId, players: {}, payments: {} };
    fs.writeFileSync(file, JSON.stringify(initial, null, 2), "utf8");
  }
}

export function assertServer(serverId: string): asserts serverId is ServerId {
  if (!validServers.includes(serverId as ServerId)) {
    throw new Error(`Invalid serverId: ${serverId}`);
  }
}

export function readDb(serverId: ServerId): ServerDb {
  ensureFile(serverId);
  return JSON.parse(fs.readFileSync(getFile(serverId), "utf8")) as ServerDb;
}

export function writeDb(serverId: ServerId, db: ServerDb): void {
  fs.writeFileSync(getFile(serverId), JSON.stringify(db, null, 2), "utf8");
}

export function listServers(): ServerId[] {
  return [...validServers];
}
