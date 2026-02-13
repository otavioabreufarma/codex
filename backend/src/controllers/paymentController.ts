import { Request, Response } from "express";
import { env } from "../config/env";
import { buildOrderNsu, createInfinitePayCheckout } from "../services/paymentService";
import { readDb, writeDb } from "../services/database";
import { applyVip, getPlayer, notifyBot } from "../services/vipService";
import { PaymentRecord, VipType } from "../types/models";

export async function createCheckout(req: Request, res: Response): Promise<void> {
  try {
    const { discordId, serverId, type } = req.body as {
      discordId?: string;
      serverId?: "server1" | "server2";
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
  const payload = req.body;

  const status = payload?.status?.toLowerCase?.() || payload?.invoice_status?.toLowerCase?.();
  const orderNsu = payload?.order_nsu || payload?.metadata?.order_nsu;

  if (!orderNsu || !status) {
    res.status(400).json({ error: "Payload inválido" });
    return;
  }

  for (const serverId of ["server1", "server2"] as const) {
    const db = readDb(serverId);
    const payment = db.payments[orderNsu];
    if (!payment) continue;

    payment.providerPayload = payload;
    payment.updatedAt = new Date().toISOString();

    if (["approved", "paid", "confirmed"].includes(status)) {
      payment.status = "approved";
      const player = applyVip(payment.serverId, payment.discordId, payment.type);
      payment.expiresAt = player.vip.expiresAt;

      await notifyBot({
        event: "payment_approved",
        serverId: payment.serverId,
        discordId: payment.discordId,
        steamId: player.steamId,
        vipType: payment.type,
        expiresAt: player.vip.expiresAt
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
