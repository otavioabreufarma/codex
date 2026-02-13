import dotenv from "dotenv";

dotenv.config();

const required = [
  "PORT",
  "BASE_URL",
  "INFINITEPAY_HANDLE",
  "INFINITEPAY_WEBHOOK_SECRET",
  "VIP_PRICE",
  "VIP_PLUS_PRICE",
  "BOT_API_KEY",
  "CHECKOUT_REDIRECT_URL",
  "CHECKOUT_WEBHOOK_URL",
  "PLUGIN_API_TOKEN"
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
  botApiKey: process.env.BOT_API_KEY as string,
  checkoutRedirectUrl: process.env.CHECKOUT_REDIRECT_URL as string,
  checkoutWebhookUrl: process.env.CHECKOUT_WEBHOOK_URL as string,
  pluginApiToken: process.env.PLUGIN_API_TOKEN as string,
  sessionSigningSecret: process.env.SESSION_SIGNING_SECRET || "replace-me"
};
