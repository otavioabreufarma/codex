import { Request, Response } from "express";
import { assertServer } from "../services/database";
import { createSteamAuthUrl, extractSteamId, validateState } from "../services/steamService";
import { getPlayer, upsertPlayerLink } from "../services/vipService";

export function getSteamAuthLink(req: Request, res: Response): void {
  const { discordId, serverId } = req.body as { discordId?: string; serverId?: string };
  if (!discordId || !serverId) {
    res.status(400).json({ error: "discordId and serverId are required" });
    return;
  }

  try {
    assertServer(serverId);
    const authUrl = createSteamAuthUrl(discordId, serverId);
    res.json({ authUrl });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

function upsertOrGet(serverId: string, discordId: string) {
  return getPlayer(serverId, discordId);
}

export function steamCallback(req: Request, res: Response): void {
  try {
    const state = req.query.state as string;
    const claimedId = req.query["openid.claimed_id"] as string;

    if (!state || !claimedId) {
      res.status(400).send("Invalid callback payload");
      return;
    }

    const { discordId, serverId } = validateState(state);
    const steamId = extractSteamId(claimedId);
    upsertPlayerLink(serverId, discordId, steamId);

    res.send("Steam vinculado com sucesso. Você já pode voltar para o Discord.");
  } catch (error) {
    res.status(400).send(`Falha ao vincular Steam: ${(error as Error).message}`);
  }
}


export function getSteamLinkStatus(req: Request, res: Response): void {
  const { discordId, serverId } = req.query as { discordId?: string; serverId?: string };
  if (!discordId || !serverId) {
    res.status(400).json({ error: "discordId and serverId are required" });
    return;
  }

  try {
    assertServer(serverId);
    const player = upsertOrGet(serverId, discordId);
    res.json({ linked: Boolean(player?.steamId), steamId: player?.steamId || null });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
