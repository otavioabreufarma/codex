"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckout = createCheckout;
exports.infinitePayWebhook = infinitePayWebhook;
exports.getBotEvents = getBotEvents;
exports.ackBotEventController = ackBotEventController;
const env_1 = require("../config/env");
const eventQueueService_1 = require("../services/eventQueueService");
const paymentService_1 = require("../services/paymentService");
const database_1 = require("../services/database");
const vipService_1 = require("../services/vipService");
const auth_1 = require("../utils/auth");
async function createCheckout(req, res) {
    try {
        const { discordId, serverId, type } = req.body;
        if (!discordId || !serverId || (type !== "vip" && type !== "vip+")) {
            res.status(400).json({ error: "discordId, serverId e type(vip|vip+) são obrigatórios" });
            return;
        }
        const player = (0, vipService_1.getPlayer)(serverId, discordId);
        if (!player) {
            res.status(400).json({ error: "Vincule sua Steam antes de comprar VIP." });
            return;
        }
        const orderNsu = (0, paymentService_1.buildOrderNsu)(serverId, discordId, type);
        const checkoutUrl = await (0, paymentService_1.createInfinitePayCheckout)({ orderNsu, type, discordId, serverId });
        const db = (0, database_1.readDb)(serverId);
        const payment = {
            orderNsu,
            discordId,
            serverId,
            type,
            amount: type === "vip" ? env_1.env.vipPrice : env_1.env.vipPlusPrice,
            checkoutUrl,
            status: "pending",
            steamId: player.steamId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        db.payments[orderNsu] = payment;
        (0, database_1.writeDb)(serverId, db);
        res.json({ orderNsu, checkoutUrl });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
async function infinitePayWebhook(req, res) {
    if (!(0, auth_1.isInfinitePayWebhookValid)(req)) {
        res.status(401).json({ error: "Invalid webhook signature" });
        return;
    }
    const payload = req.body;
    const status = payload?.status?.toLowerCase?.() || payload?.invoice_status?.toLowerCase?.();
    const orderNsu = payload?.order_nsu || payload?.metadata?.order_nsu;
    const transactionNsu = payload?.transaction_nsu || payload?.transaction?.nsu;
    if (!orderNsu || !transactionNsu || !status) {
        res.status(400).json({ error: "Payload inválido" });
        return;
    }
    for (const serverId of ["server1", "server2"]) {
        const db = (0, database_1.readDb)(serverId);
        const payment = db.payments[orderNsu];
        if (!payment)
            continue;
        payment.providerPayload = payload;
        payment.transactionNsu = transactionNsu;
        payment.updatedAt = new Date().toISOString();
        if (["approved", "paid", "confirmed"].includes(status) && payment.status !== "approved") {
            payment.status = "approved";
            const player = (0, vipService_1.applyVip)(payment.serverId, payment.discordId, payment.type);
            payment.expiresAt = player.vip.expiresAt;
            (0, eventQueueService_1.enqueueBotEvent)({
                type: "PAYMENT_CONFIRMED",
                discordId: payment.discordId,
                serverId: payment.serverId,
                vipType: payment.type
            });
        }
        else if (["failed", "refunded", "canceled"].includes(status)) {
            payment.status = "failed";
        }
        db.payments[orderNsu] = payment;
        (0, database_1.writeDb)(serverId, db);
        res.json({ received: true });
        return;
    }
    res.status(404).json({ error: "Pedido não encontrado" });
}
function getBotEvents(_req, res) {
    res.json({ events: (0, eventQueueService_1.getPendingBotEvents)() });
}
function ackBotEventController(req, res) {
    const ok = (0, eventQueueService_1.ackBotEvent)(req.params.eventId);
    if (!ok) {
        res.status(404).json({ error: "Event not found" });
        return;
    }
    res.json({ ok: true });
}
