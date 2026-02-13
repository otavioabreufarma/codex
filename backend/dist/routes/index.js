"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const paymentController_1 = require("../controllers/paymentController");
const vipController_1 = require("../controllers/vipController");
const auth_1 = require("../utils/auth");
const router = (0, express_1.Router)();
router.get("/health", (_req, res) => {
    res.json({ ok: true });
});
router.post("/auth/steam/link", auth_1.requireBotToken, authController_1.getSteamAuthLink);
router.get("/auth/steam/callback", authController_1.steamCallback);
router.post("/payments/checkout", auth_1.requireBotToken, paymentController_1.createCheckout);
router.post("/webhooks/infinitepay", auth_1.verifyInfinitePaySignature, paymentController_1.infinitePayWebhook);
router.post("/plugin/vip/apply", auth_1.requireServerToken, vipController_1.applyVipHandler);
router.post("/plugin/vip/remove", auth_1.requireServerToken, vipController_1.removeVipHandler);
router.get("/plugin/vip/:serverId/:discordId", auth_1.requireServerToken, vipController_1.getVipStatusHandler);
exports.default = router;
