import { Request, Response } from "express";
import { createSteamAuthUrl, extractSteamId, validateState } from "../services/steamService";
import { upsertPlayerLink } from "../services/vipService";

export function getSteamAuthLink(req: Request, res: Response): void {
  const { discordId, serverId } = req.body as { discordId?: string; serverId?: string };
  if (!discordId || !serverId) {
    res.status(400).json({ error: "discordId and serverId are required" });
    return;
  }

  const authUrl = createSteamAuthUrl(discordId, serverId);
  res.json({ authUrl });
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
