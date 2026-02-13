"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUserServer = setUserServer;
exports.getUserServer = getUserServer;
const serverSelection = new Map();
function setUserServer(userId, serverId) {
    serverSelection.set(userId, serverId);
}
function getUserServer(userId) {
    return serverSelection.get(userId) || "server1";
}
