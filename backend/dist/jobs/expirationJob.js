"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startExpirationJob = startExpirationJob;
const env_1 = require("../config/env");
const vipService_1 = require("../services/vipService");
function startExpirationJob() {
    setInterval(async () => {
        const expired = (0, vipService_1.findExpiredVipEvents)();
        for (const event of expired) {
            await (0, vipService_1.notifyBot)({
                event: "vip_expired",
                ...event
            });
        }
    }, env_1.env.checkExpiredIntervalMs);
}
