"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
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
];
for (const key of required) {
    if (!process.env[key]) {
        throw new Error(`Missing required env var: ${key}`);
    }
}
exports.env = {
    port: Number(process.env.PORT),
    baseUrl: process.env.BASE_URL,
    steamApiKey: process.env.STEAM_API_KEY || "",
    infinitepayHandle: process.env.INFINITEPAY_HANDLE,
    infinitepayWebhookSecret: process.env.INFINITEPAY_WEBHOOK_SECRET,
    infinitepayApiToken: process.env.INFINITEPAY_API_TOKEN || "",
    vipPrice: Number(process.env.VIP_PRICE),
    vipPlusPrice: Number(process.env.VIP_PLUS_PRICE),
    vipDurationDays: Number(process.env.VIP_DURATION_DAYS || 30),
    vipPlusDurationDays: Number(process.env.VIP_PLUS_DURATION_DAYS || 30),
    checkExpiredIntervalMs: Number(process.env.CHECK_EXPIRED_INTERVAL_MS || 60000),
    sessionSigningSecret: process.env.SESSION_SIGNING_SECRET,
    serverTokens: {
        server1: process.env.SERVER1_API_TOKEN,
        server2: process.env.SERVER2_API_TOKEN
    },
    botWebhookToken: process.env.BOT_WEBHOOK_TOKEN,
    botWebhookUrl: process.env.BOT_WEBHOOK_URL,
    checkoutRedirectUrl: process.env.CHECKOUT_REDIRECT_URL,
    checkoutWebhookUrl: process.env.CHECKOUT_WEBHOOK_URL
};
