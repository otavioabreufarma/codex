import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

export function requireServerToken(req: Request, res: Response, next: NextFunction): void {
  const token = req.header("x-api-token");
  const serverId = req.params.serverId || req.body.serverId || req.query.serverId;

  if (!token || !serverId || !(serverId in env.serverTokens)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const expected = env.serverTokens[serverId as keyof typeof env.serverTokens];
  if (token !== expected) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  next();
}

export function requireBotToken(req: Request, res: Response, next: NextFunction): void {
  if (req.header("x-bot-token") !== env.botWebhookToken) {
    res.status(401).json({ error: "Unauthorized bot" });
    return;
  }
  next();
}

export function verifyInfinitePaySignature(req: Request, res: Response, next: NextFunction): void {
  const signature = req.header("x-infinitepay-signature") || req.header("x-webhook-secret");

  if (!signature || signature !== env.infinitepayWebhookSecret) {
    res.status(401).json({ error: "Invalid webhook signature" });
    return;
  }

  next();
}
