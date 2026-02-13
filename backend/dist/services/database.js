"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertServer = assertServer;
exports.readDb = readDb;
exports.writeDb = writeDb;
exports.listServers = listServers;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dataDir = path_1.default.join(process.cwd(), "data");
const validServers = ["server1", "server2"];
function getFile(serverId) {
    return path_1.default.join(dataDir, `${serverId}.json`);
}
function ensureFile(serverId) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
    const file = getFile(serverId);
    if (!fs_1.default.existsSync(file)) {
        const initial = { serverId, players: {}, payments: {} };
        fs_1.default.writeFileSync(file, JSON.stringify(initial, null, 2), "utf8");
    }
}
function assertServer(serverId) {
    if (!validServers.includes(serverId)) {
        throw new Error(`Invalid serverId: ${serverId}`);
    }
}
function readDb(serverId) {
    ensureFile(serverId);
    return JSON.parse(fs_1.default.readFileSync(getFile(serverId), "utf8"));
}
function writeDb(serverId, db) {
    fs_1.default.writeFileSync(getFile(serverId), JSON.stringify(db, null, 2), "utf8");
}
function listServers() {
    return [...validServers];
}
