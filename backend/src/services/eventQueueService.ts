import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { BotEvent, BotEventType, ServerId, VipType } from "../types/models";

interface EventQueueFile {
  events: BotEvent[];
}

const eventsDir = path.join(process.cwd(), "events");
const eventsFile = path.join(eventsDir, "pending_bot_events.json");

function ensureQueueFile(): void {
  fs.mkdirSync(eventsDir, { recursive: true });
  if (!fs.existsSync(eventsFile)) {
    fs.writeFileSync(eventsFile, JSON.stringify({ events: [] }, null, 2), "utf8");
  }
}

function readQueue(): EventQueueFile {
  ensureQueueFile();
  return JSON.parse(fs.readFileSync(eventsFile, "utf8")) as EventQueueFile;
}

function writeQueue(queue: EventQueueFile): void {
  fs.writeFileSync(eventsFile, JSON.stringify(queue, null, 2), "utf8");
}

export function enqueueBotEvent(params: {
  type: BotEventType;
  discordId: string;
  serverId: ServerId;
  vipType?: VipType;
}): BotEvent {
  const queue = readQueue();
  const event: BotEvent = {
    eventId: uuidv4(),
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

export function getPendingBotEvents(limit = 50): BotEvent[] {
  const queue = readQueue();
  return queue.events.filter((event) => !event.processed).slice(0, limit);
}

export function ackBotEvent(eventId: string): boolean {
  const queue = readQueue();
  const event = queue.events.find((current) => current.eventId === eventId);
  if (!event) return false;
  event.processed = true;
  writeQueue(queue);
  return true;
}
