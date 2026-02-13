import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

export function requirePluginToken(req: Request, res: Response, next: NextFunction): void {
  const token = req.header("x-api-token");
  if (!token || token !== env.pluginApiToken) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

export function requireBotApiKey(req: Request, res: Response, next: NextFunction): void {
  const token = req.header("x-api-key");
  if (!token || token !== env.botApiKey) {
    res.status(401).json({ error: "Unauthorized bot" });
    return;
  }
  next();
}

export function isInfinitePayWebhookValid(req: Request): boolean {
  const signature = req.header("x-infinitepay-signature") || req.header("x-webhook-secret");
  return Boolean(signature && signature === env.infinitepayWebhookSecret);
}
