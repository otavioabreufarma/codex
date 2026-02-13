"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildOrderNsu = buildOrderNsu;
exports.createInfinitePayCheckout = createInfinitePayCheckout;
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const env_1 = require("../config/env");
function buildOrderNsu(serverId, discordId, type) {
    return `${serverId}-${discordId}-${type}-${Date.now()}-${(0, uuid_1.v4)().slice(0, 8)}`;
}
async function createInfinitePayCheckout(params) {
    const amount = params.type === "vip" ? env_1.env.vipPrice : env_1.env.vipPlusPrice;
    const payload = {
        handle: env_1.env.infinitepayHandle,
        amount,
        description: `VIP ${params.type.toUpperCase()} - ${params.serverId}`,
        order_nsu: params.orderNsu,
        redirect_url: env_1.env.checkoutRedirectUrl,
        webhook_url: env_1.env.checkoutWebhookUrl,
        metadata: {
            discordId: params.discordId,
            serverId: params.serverId,
            vipType: params.type
        }
    };
    const headers = { "Content-Type": "application/json" };
    if (env_1.env.infinitepayApiToken) {
        headers.Authorization = `Bearer ${env_1.env.infinitepayApiToken}`;
    }
    const response = await axios_1.default.post("https://api.infinitepay.io/invoices/public/checkout/links", payload, { headers });
    const checkoutUrl = response.data?.url || response.data?.checkout_url || response.data?.data?.url;
    if (!checkoutUrl) {
        throw new Error("InfinitePay API did not return checkout URL");
    }
    return checkoutUrl;
}
