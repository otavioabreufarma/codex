import dotenv from "dotenv";

dotenv.config();

const required = [
  "PORT",
  "BASE_URL",
  "INFINITEPAY_HANDLE",
  "INFINITEPAY_WEBHOOK_SECRET",
  "VIP_PRICE",
  "VIP_PLUS_PRICE",
  "SESSION_SIGNING_SECRET",
  "SERVER1_API_TOKEN",
  "SERVER2_API_TOKEN",
  "BOT_WEBHOOK_TOKEN",
  "BOT_WEBHOOK_URL",
  "CHECKOUT_REDIRECT_URL",
  "CHECKOUT_WEBHOOK_URL"
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT),
  baseUrl: process.env.BASE_URL as string,
  steamApiKey: process.env.STEAM_API_KEY || "",
  infinitepayHandle: process.env.INFINITEPAY_HANDLE as string,
  infinitepayWebhookSecret: process.env.INFINITEPAY_WEBHOOK_SECRET as string,
  infinitepayApiToken: process.env.INFINITEPAY_API_TOKEN || "",
  vipPrice: Number(process.env.VIP_PRICE),
  vipPlusPrice: Number(process.env.VIP_PLUS_PRICE),
  vipDurationDays: Number(process.env.VIP_DURATION_DAYS || 30),
  vipPlusDurationDays: Number(process.env.VIP_PLUS_DURATION_DAYS || 30),
  checkExpiredIntervalMs: Number(process.env.CHECK_EXPIRED_INTERVAL_MS || 60000),
  sessionSigningSecret: process.env.SESSION_SIGNING_SECRET as string,
  serverTokens: {
    server1: process.env.SERVER1_API_TOKEN as string,
    server2: process.env.SERVER2_API_TOKEN as string
  },
  botWebhookToken: process.env.BOT_WEBHOOK_TOKEN as string,
  botWebhookUrl: process.env.BOT_WEBHOOK_URL as string,
  checkoutRedirectUrl: process.env.CHECKOUT_REDIRECT_URL as string,
  checkoutWebhookUrl: process.env.CHECKOUT_WEBHOOK_URL as string
};
