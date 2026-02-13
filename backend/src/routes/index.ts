import { Router } from "express";
import { getSteamAuthLink, getSteamLinkStatus, steamCallback } from "../controllers/authController";
import {
  ackBotEventController,
  createCheckout,
  getBotEvents,
  infinitePayWebhook
} from "../controllers/paymentController";
import { applyVipHandler, getVipStatusHandler, removeVipHandler } from "../controllers/vipController";
import { requireBotApiKey, requirePluginToken } from "../utils/auth";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true });
});

router.post("/auth/steam/link", requireBotApiKey, getSteamAuthLink);
router.get("/auth/steam/callback", steamCallback);
router.get("/auth/steam/status", requireBotApiKey, getSteamLinkStatus);

router.post("/payments/checkout", requireBotApiKey, createCheckout);
router.post("/webhooks/infinitepay", infinitePayWebhook);

router.get("/bot/events", requireBotApiKey, getBotEvents);
router.post("/bot/events/:eventId/ack", requireBotApiKey, ackBotEventController);

router.post("/plugin/vip/apply", requirePluginToken, applyVipHandler);
router.post("/plugin/vip/remove", requirePluginToken, removeVipHandler);
router.get("/plugin/vip/:serverId/:discordId", requirePluginToken, getVipStatusHandler);

export default router;
