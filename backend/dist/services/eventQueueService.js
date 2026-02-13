"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueBotEvent = enqueueBotEvent;
exports.getPendingBotEvents = getPendingBotEvents;
exports.ackBotEvent = ackBotEvent;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const eventsDir = path_1.default.join(process.cwd(), "events");
const eventsFile = path_1.default.join(eventsDir, "pending_bot_events.json");
function ensureQueueFile() {
    fs_1.default.mkdirSync(eventsDir, { recursive: true });
    if (!fs_1.default.existsSync(eventsFile)) {
        fs_1.default.writeFileSync(eventsFile, JSON.stringify({ events: [] }, null, 2), "utf8");
    }
}
function readQueue() {
    ensureQueueFile();
    return JSON.parse(fs_1.default.readFileSync(eventsFile, "utf8"));
}
function writeQueue(queue) {
    fs_1.default.writeFileSync(eventsFile, JSON.stringify(queue, null, 2), "utf8");
}
function enqueueBotEvent(params) {
    const queue = readQueue();
    const event = {
        eventId: (0, uuid_1.v4)(),
        type: params.type,
        discordId: params.discordId,
        serverId: params.serverId,
        vipType: params.vipType,
        createdAt: new Date().toISOString(),
        processed: false
    };
    queue.events.push(event);
    writeQueue(queue);
    return event;
}
function getPendingBotEvents(limit = 50) {
    const queue = readQueue();
    return queue.events.filter((event) => !event.processed).slice(0, limit);
}
function ackBotEvent(eventId) {
    const queue = readQueue();
    const event = queue.events.find((current) => current.eventId === eventId);
    if (!event)
        return false;
    event.processed = true;
    writeQueue(queue);
    return true;
}
