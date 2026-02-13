import { Router } from "express";
import { getSteamAuthLink, steamCallback } from "../controllers/authController";
import { createCheckout, infinitePayWebhook } from "../controllers/paymentController";
import { applyVipHandler, getVipStatusHandler, removeVipHandler } from "../controllers/vipController";
import { requireBotToken, requireServerToken, verifyInfinitePaySignature } from "../utils/auth";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true });
});

router.post("/auth/steam/link", requireBotToken, getSteamAuthLink);
router.get("/auth/steam/callback", steamCallback);

router.post("/payments/checkout", requireBotToken, createCheckout);
router.post("/webhooks/infinitepay", verifyInfinitePaySignature, infinitePayWebhook);

router.post("/plugin/vip/apply", requireServerToken, applyVipHandler);
router.post("/plugin/vip/remove", requireServerToken, removeVipHandler);
router.get("/plugin/vip/:serverId/:discordId", requireServerToken, getVipStatusHandler);

export default router;
