import { Request, Response } from "express";
import { env } from "../config/env";
import { ackBotEvent, enqueueBotEvent, getPendingBotEvents } from "../services/eventQueueService";
import { buildOrderNsu, createInfinitePayCheckout } from "../services/paymentService";
import { readDb, writeDb } from "../services/database";
import { applyVip, getPlayer } from "../services/vipService";
import { PaymentRecord, ServerId, VipType } from "../types/models";
import { isInfinitePayWebhookValid } from "../utils/auth";

export async function createCheckout(req: Request, res: Response): Promise<void> {
  try {
    const { discordId, serverId, type } = req.body as {
      discordId?: string;
      serverId?: ServerId;
      type?: VipType;
    };

    if (!discordId || !serverId || (type !== "vip" && type !== "vip+")) {
      res.status(400).json({ error: "discordId, serverId e type(vip|vip+) são obrigatórios" });
      return;
    }

    const player = getPlayer(serverId, discordId);
    if (!player) {
      res.status(400).json({ error: "Vincule sua Steam antes de comprar VIP." });
      return;
    }

    const orderNsu = buildOrderNsu(serverId, discordId, type);
    const checkoutUrl = await createInfinitePayCheckout({ orderNsu, type, discordId, serverId });

    const db = readDb(serverId);
    const payment: PaymentRecord = {
      orderNsu,
      discordId,
      serverId,
      type,
      amount: type === "vip" ? env.vipPrice : env.vipPlusPrice,
      checkoutUrl,
      status: "pending",
      steamId: player.steamId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.payments[orderNsu] = payment;
    writeDb(serverId, db);

    res.json({ orderNsu, checkoutUrl });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function infinitePayWebhook(req: Request, res: Response): Promise<void> {
  if (!isInfinitePayWebhookValid(req)) {
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

  for (const serverId of ["server1", "server2"] as const) {
    const db = readDb(serverId);
    const payment = db.payments[orderNsu];
    if (!payment) continue;

    payment.providerPayload = payload;
    payment.transactionNsu = transactionNsu;
    payment.updatedAt = new Date().toISOString();

    if (["approved", "paid", "confirmed"].includes(status) && payment.status !== "approved") {
      payment.status = "approved";
      const player = applyVip(payment.serverId, payment.discordId, payment.type);
      payment.expiresAt = player.vip.expiresAt;

      enqueueBotEvent({
        type: "PAYMENT_CONFIRMED",
        discordId: payment.discordId,
        serverId: payment.serverId,
        vipType: payment.type
      });
    } else if (["failed", "refunded", "canceled"].includes(status)) {
      payment.status = "failed";
    }

    db.payments[orderNsu] = payment;
    writeDb(serverId, db);
    res.json({ received: true });
    return;
  }

  res.status(404).json({ error: "Pedido não encontrado" });
}

export function getBotEvents(_req: Request, res: Response): void {
  res.json({ events: getPendingBotEvents() });
}

export function ackBotEventController(req: Request, res: Response): void {
  const ok = ackBotEvent(req.params.eventId);
  if (!ok) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.json({ ok: true });
}
