import { env } from "../config/env";
import { enqueueBotEvent } from "../services/eventQueueService";
import { expireVipAndCollectEvents } from "../services/vipService";

export function startExpirationJob(): void {
  setInterval(() => {
    const expired = expireVipAndCollectEvents();
    for (const event of expired) {
      enqueueBotEvent({
        type: "VIP_EXPIRED",
        discordId: event.discordId,
        serverId: event.serverId,
        vipType: event.vipType
      });
    }
  }, env.checkExpiredIntervalMs);
}
