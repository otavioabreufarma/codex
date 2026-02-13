"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startExpirationJob = startExpirationJob;
const env_1 = require("../config/env");
const eventQueueService_1 = require("../services/eventQueueService");
const vipService_1 = require("../services/vipService");
function startExpirationJob() {
    setInterval(() => {
        const expired = (0, vipService_1.expireVipAndCollectEvents)();
        for (const event of expired) {
            (0, eventQueueService_1.enqueueBotEvent)({
                type: "VIP_EXPIRED",
                discordId: event.discordId,
                serverId: event.serverId,
                vipType: event.vipType
            });
        }
    }, env_1.env.checkExpiredIntervalMs);
}
