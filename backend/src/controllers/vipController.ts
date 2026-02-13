import { Request, Response } from "express";
import { applyVip, getPlayer, getVipStatus, removeVip } from "../services/vipService";
import { VipType } from "../types/models";

export function applyVipHandler(req: Request, res: Response): void {
  try {
    const { serverId, discordId, type } = req.body as {
      serverId?: string;
      discordId?: string;
      type?: VipType;
    };

    if (!serverId || !discordId || (type !== "vip" && type !== "vip+")) {
      res.status(400).json({ error: "serverId, discordId e type(vip|vip+) são obrigatórios" });
      return;
    }

    const player = applyVip(serverId, discordId, type);
    res.json({ ok: true, player });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export function removeVipHandler(req: Request, res: Response): void {
  try {
    const { serverId, discordId } = req.body as { serverId?: string; discordId?: string };
    if (!serverId || !discordId) {
      res.status(400).json({ error: "serverId e discordId são obrigatórios" });
      return;
    }

    const player = removeVip(serverId, discordId);
    res.json({ ok: true, player });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export function getVipStatusHandler(req: Request, res: Response): void {
  try {
    const { serverId, discordId } = req.params;
    const status = getVipStatus(serverId, discordId);
    const player = getPlayer(serverId, discordId);

    res.json({
      discordId,
      steamId: player?.steamId,
      serverId,
      vip: status
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
