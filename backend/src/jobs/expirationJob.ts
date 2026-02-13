import { env } from "../config/env";
import { findExpiredVipEvents, notifyBot } from "../services/vipService";

export function startExpirationJob(): void {
  setInterval(async () => {
    const expired = findExpiredVipEvents();
    for (const event of expired) {
      await notifyBot({
        event: "vip_expired",
        ...event
      });
    }
  }, env.checkExpiredIntervalMs);
}
